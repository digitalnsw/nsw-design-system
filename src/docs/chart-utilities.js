const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round = (value, precision = 3) => Number(value.toFixed(precision))

const parseHexColor = (raw) => {
  const hex = raw.replace(/^#/, '').trim()
  if (![3, 4, 6, 8].includes(hex.length)) return null

  const expand = (part) => (part.length === 1 ? `${part}${part}` : part)
  const short = hex.length <= 4

  const r = expand(hex.slice(0, short ? 1 : 2))
  const g = expand(hex.slice(short ? 1 : 2, short ? 2 : 4))
  const b = expand(hex.slice(short ? 2 : 4, short ? 3 : 6))

  const rr = parseInt(r, 16)
  const gg = parseInt(g, 16)
  const bb = parseInt(b, 16)
  let aa = 1
  if (short && hex.length === 4) {
    aa = parseInt(expand(hex.slice(3, 4)), 16) / 255
  } else if (hex.length === 8) {
    aa = parseInt(hex.slice(6, 8), 16) / 255
  }

  if ([rr, gg, bb, aa].some((n) => Number.isNaN(n))) return null
  return {
    r: rr,
    g: gg,
    b: bb,
    a: clamp(aa, 0, 1),
  }
}

const parseRgbColor = (raw) => {
  const match = raw.trim().match(/^rgba?\(\s*([^)]+)\s*\)$/i)
  if (!match) return null

  const parts = match[1]
    .replace(/\s*\/\s*/g, ',')
    .replace(/\s+/g, ',')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length < 3) return null

  const toChannel = (value) => {
    if (value.endsWith('%')) {
      return clamp(Math.round((parseFloat(value) / 100) * 255), 0, 255)
    }
    return clamp(parseInt(value, 10), 0, 255)
  }

  const r = toChannel(parts[0])
  const g = toChannel(parts[1])
  const b = toChannel(parts[2])

  if ([r, g, b].some((n) => Number.isNaN(n))) return null

  let a = 1
  if (parts[3] != null) {
    a = parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])
    a = clamp(Number.isNaN(a) ? 1 : a, 0, 1)
  }

  return {
    r,
    g,
    b,
    a,
  }
}

const parseColorToRgba = (color) => {
  if (!color || typeof color !== 'string') return null

  const value = color.trim()
  const rgb = parseRgbColor(value)
  if (rgb) return rgb

  const hex = parseHexColor(value)
  if (hex) return hex

  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return null

  const previousFill = context.fillStyle
  context.fillStyle = '#000000'
  context.fillStyle = value
  const normalised = context.fillStyle
  context.fillStyle = previousFill

  return parseRgbColor(normalised) || parseHexColor(normalised)
}

const parseColorToRgb = (color) => {
  const rgba = parseColorToRgba(color)
  if (!rgba) return null
  return { r: rgba.r, g: rgba.g, b: rgba.b }
}

const getRelativeLuminance = ({ r, g, b }) => {
  const toLinear = (channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }

  return (0.2126 * toLinear(r)) + (0.7152 * toLinear(g)) + (0.0722 * toLinear(b))
}

const getContrastRatio = (leftLuminance, rightLuminance) => {
  const lighter = Math.max(leftLuminance, rightLuminance)
  const darker = Math.min(leftLuminance, rightLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

const withAlpha = (color, alpha) => {
  const rgba = parseColorToRgba(color)
  if (!rgba) return color
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${round(clamp(alpha, 0, 1), 4)})`
}

const blendRgb = (background, foreground, alpha) => {
  const ratio = clamp(alpha, 0, 1)
  return {
    r: Math.round((foreground.r * ratio) + (background.r * (1 - ratio))),
    g: Math.round((foreground.g * ratio) + (background.g * (1 - ratio))),
    b: Math.round((foreground.b * ratio) + (background.b * (1 - ratio))),
  }
}

const getContrastAtAlpha = (baseColor, inkColor, alpha) => {
  const base = parseColorToRgb(baseColor)
  const ink = parseColorToRgb(inkColor)
  if (!base || !ink) return 0
  const blended = blendRgb(base, ink, alpha)
  return getContrastRatio(
    getRelativeLuminance(base),
    getRelativeLuminance(blended),
  )
}

const getMinimumAlphaForContrast = (baseColor, inkColor, options = {}) => {
  const {
    minContrast = 3,
    minAlpha = 0.35,
    maxAlpha = 1,
    precision = 4,
  } = options

  const threshold = Number.isFinite(minContrast) ? minContrast : 3
  const lowerBound = clamp(Number.isFinite(minAlpha) ? minAlpha : 0.35, 0, 1)
  const upperBound = clamp(Number.isFinite(maxAlpha) ? maxAlpha : 1, lowerBound, 1)

  const maxContrast = getContrastAtAlpha(baseColor, inkColor, upperBound)
  if (maxContrast < threshold) return round(upperBound, precision)

  const minContrastAtLower = getContrastAtAlpha(baseColor, inkColor, lowerBound)
  if (minContrastAtLower >= threshold) return round(lowerBound, precision)

  let low = lowerBound
  let high = upperBound

  for (let i = 0; i < 14; i += 1) {
    const midpoint = (low + high) / 2
    const contrast = getContrastAtAlpha(baseColor, inkColor, midpoint)
    if (contrast >= threshold) {
      high = midpoint
    } else {
      low = midpoint
    }
  }

  return round(high, precision)
}

const getAutoInk = (baseColor, darkColor = '#22272b', lightColor = '#ffffff') => {
  const base = parseColorToRgba(baseColor)
  const dark = parseColorToRgba(darkColor)
  const light = parseColorToRgba(lightColor)

  if (!base || !dark || !light) return darkColor

  const baseLuminance = getRelativeLuminance(base)
  const darkLuminance = getRelativeLuminance(dark)
  const lightLuminance = getRelativeLuminance(light)

  const darkContrast = getContrastRatio(baseLuminance, darkLuminance)
  const lightContrast = getContrastRatio(baseLuminance, lightLuminance)

  return lightContrast > darkContrast ? lightColor : darkColor
}

const toHexKey = (color) => {
  const rgb = parseColorToRgb(color)
  if (!rgb) return null
  const toHex = (value) => value.toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

const defaultNswInkIndex = Object.freeze({
  '--nsw-palette-blue-01': { baseColor: '#002664', inkColor: '#cbedfd' },
  '--nsw-palette-blue-02': { baseColor: '#146cfd', inkColor: '#ffffff' },
  '--nsw-palette-blue-03': { baseColor: '#8ce0ff', inkColor: '#002664' },
  '--nsw-palette-blue-04': { baseColor: '#cbedfd', inkColor: '#002664' },
  '--nsw-palette-purple-01': { baseColor: '#441170', inkColor: '#ffffff' },
  '--nsw-palette-purple-02': { baseColor: '#8055f1', inkColor: '#ffffff' },
  '--nsw-palette-purple-03': { baseColor: '#CEBFFF', inkColor: '#630019' },
  '--nsw-palette-purple-04': { baseColor: '#e6e1fd', inkColor: '#495054' },
  '--nsw-palette-fuchsia-01': { baseColor: '#65004d', inkColor: '#ffffff' },
  '--nsw-palette-fuchsia-02': { baseColor: '#d912ae', inkColor: '#ffffff' },
  '--nsw-palette-fuchsia-03': { baseColor: '#f4b5e6', inkColor: '#495054' },
  '--nsw-palette-fuchsia-04': { baseColor: '#fddef2', inkColor: '#495054' },
  '--nsw-palette-red-01': { baseColor: '#630019', inkColor: '#ffffff' },
  '--nsw-palette-red-02': { baseColor: '#d7153a', inkColor: '#ffffff' },
  '--nsw-palette-red-03': { baseColor: '#ffb8c1', inkColor: '#495054' },
  '--nsw-palette-red-04': { baseColor: '#ffe6ea', inkColor: '#495054' },
  '--nsw-palette-orange-01': { baseColor: '#941b00', inkColor: '#ffffff' },
  '--nsw-palette-orange-02': { baseColor: '#f3631b', inkColor: '#22272b' },
  '--nsw-palette-orange-03': { baseColor: '#ffce99', inkColor: '#495054' },
  '--nsw-palette-orange-04': { baseColor: '#fdeddf', inkColor: '#495054' },
  '--nsw-palette-brown-01': { baseColor: '#523719', inkColor: '#ffffff' },
  '--nsw-palette-brown-02': { baseColor: '#b68d5d', inkColor: '#ffffff' },
  '--nsw-palette-brown-03': { baseColor: '#e8d0b5', inkColor: '#495054' },
  '--nsw-palette-brown-04': { baseColor: '#ede3d7', inkColor: '#495054' },
  '--nsw-palette-yellow-01': { baseColor: '#694800', inkColor: '#ffffff' },
  '--nsw-palette-yellow-02': { baseColor: '#faaf05', inkColor: '#22272b' },
  '--nsw-palette-yellow-03': { baseColor: '#fde79a', inkColor: '#495054' },
  '--nsw-palette-yellow-04': { baseColor: '#fff4cf', inkColor: '#495054' },
  '--nsw-palette-green-01': { baseColor: '#004000', inkColor: '#ffffff' },
  '--nsw-palette-green-02': { baseColor: '#00aa45', inkColor: '#ffffff' },
  '--nsw-palette-green-03': { baseColor: '#a8edb3', inkColor: '#495054' },
  '--nsw-palette-green-04': { baseColor: '#dbfadf', inkColor: '#495054' },
  '--nsw-palette-teal-01': { baseColor: '#0b3f47', inkColor: '#ffffff' },
  '--nsw-palette-teal-02': { baseColor: '#2e808e', inkColor: '#ffffff' },
  '--nsw-palette-teal-03': { baseColor: '#8cdbe5', inkColor: '#495054' },
  '--nsw-palette-teal-04': { baseColor: '#d1eeea', inkColor: '#495054' },
  '--nsw-palette-black': { baseColor: '#000000', inkColor: '#ffffff' },
  '--nsw-palette-grey-01': { baseColor: '#22272b', inkColor: '#ffffff' },
  '--nsw-palette-grey-02': { baseColor: '#495054', inkColor: '#ffffff' },
  '--nsw-palette-grey-03': { baseColor: '#cdd3d6', inkColor: '#495054' },
  '--nsw-palette-grey-04': { baseColor: '#ebebeb', inkColor: '#495054' },
  '--nsw-palette-off-white': { baseColor: '#f2f2f2', inkColor: '#495054' },
  '--nsw-palette-white': { baseColor: '#ffffff', inkColor: '#495054' },
  '--nsw-aboriginal-palette-earth-red': { baseColor: '#950906', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-ember-red': { baseColor: '#e1261c', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-coral-pink': { baseColor: '#fbb4b3', inkColor: '#495054' },
  '--nsw-aboriginal-palette-galah-pink': { baseColor: '#fdd9d9', inkColor: '#495054' },
  '--nsw-aboriginal-palette-deep-orange': { baseColor: '#882600', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-orange-ochre': { baseColor: '#ee6314', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-clay-orange': { baseColor: '#f4aa7d', inkColor: '#495054' },
  '--nsw-aboriginal-palette-sunset-orange': { baseColor: '#f9d4be', inkColor: '#495054' },
  '--nsw-aboriginal-palette-bush-honey-yellow': { baseColor: '#895e00', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-sandstone-yellow': { baseColor: '#fea927', inkColor: '#495054' },
  '--nsw-aboriginal-palette-golden-wattle-yellow': { baseColor: '#fee48c', inkColor: '#495054' },
  '--nsw-aboriginal-palette-sunbeam-yellow': { baseColor: '#fff1c5', inkColor: '#495054' },
  '--nsw-aboriginal-palette-riverbed-brown': { baseColor: '#552105', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-firewood-brown': { baseColor: '#9e5332', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-claystone-brown': { baseColor: '#d39165', inkColor: '#495054' },
  '--nsw-aboriginal-palette-macadamia-brown': { baseColor: '#e9c8b2', inkColor: '#495054' },
  '--nsw-aboriginal-palette-charcoal-grey': { baseColor: '#272727', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-emu-grey': { baseColor: '#555555', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-ash-grey': { baseColor: '#ccc6c2', inkColor: '#495054' },
  '--nsw-aboriginal-palette-smoke-grey': { baseColor: '#e5e3e0', inkColor: '#495054' },
  '--nsw-aboriginal-palette-bushland-green': { baseColor: '#215834', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-marshland-lime': { baseColor: '#78a146', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-gumleaf-green': { baseColor: '#b5cda4', inkColor: '#495054' },
  '--nsw-aboriginal-palette-saltbush-green': { baseColor: '#dae6d1', inkColor: '#495054' },
  '--nsw-aboriginal-palette-billabong-blue': { baseColor: '#00405e', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-saltwater-blue': { baseColor: '#0d6791', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-light-water-blue': { baseColor: '#84c5d1', inkColor: '#495054' },
  '--nsw-aboriginal-palette-coastal-blue': { baseColor: '#c1e2e8', inkColor: '#495054' },
  '--nsw-aboriginal-palette-bush-plum': { baseColor: '#472642', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-spirit-lilac': { baseColor: '#9a5e93', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-lilli-pilli-purple': { baseColor: '#c99ac2', inkColor: '#495054' },
  '--nsw-aboriginal-palette-dusk-purple': { baseColor: '#e4cce0', inkColor: '#495054' },
  '--nsw-aboriginal-palette-black': { baseColor: '#000000', inkColor: '#ffffff' },
  '--nsw-aboriginal-palette-off-white': { baseColor: '#f2f2f2', inkColor: '#495054' },
  '--nsw-aboriginal-palette-white': { baseColor: '#ffffff', inkColor: '#495054' },
})

const defaultInkCandidates = Object.freeze([
  '#ffffff',
  '#22272b',
  '#495054',
  '#002664',
  '#cbedfd',
])

const defaultPatternBaseAlphaByStyle = Object.freeze({
  default: 0.5,
  diagonal: 0.48,
  vertical: 0.52,
  dots: 0.54,
  zigzag: 0.5,
  cross: 0.5,
})

const nswChartPaletteTokens = Object.freeze({
  blue01: '--nsw-palette-blue-01',
  blue02: '--nsw-palette-blue-02',
  blue03: '--nsw-palette-blue-03',
  blue04: '--nsw-palette-blue-04',
  purple01: '--nsw-palette-purple-01',
  purple02: '--nsw-palette-purple-02',
  purple03: '--nsw-palette-purple-03',
  purple04: '--nsw-palette-purple-04',
  fuchsia01: '--nsw-palette-fuchsia-01',
  fuchsia02: '--nsw-palette-fuchsia-02',
  fuchsia03: '--nsw-palette-fuchsia-03',
  fuchsia04: '--nsw-palette-fuchsia-04',
  red01: '--nsw-palette-red-01',
  red02: '--nsw-palette-red-02',
  red03: '--nsw-palette-red-03',
  red04: '--nsw-palette-red-04',
  orange01: '--nsw-palette-orange-01',
  orange02: '--nsw-palette-orange-02',
  orange03: '--nsw-palette-orange-03',
  orange04: '--nsw-palette-orange-04',
  brown01: '--nsw-palette-brown-01',
  brown02: '--nsw-palette-brown-02',
  brown03: '--nsw-palette-brown-03',
  brown04: '--nsw-palette-brown-04',
  yellow01: '--nsw-palette-yellow-01',
  yellow02: '--nsw-palette-yellow-02',
  yellow03: '--nsw-palette-yellow-03',
  yellow04: '--nsw-palette-yellow-04',
  green01: '--nsw-palette-green-01',
  green02: '--nsw-palette-green-02',
  green03: '--nsw-palette-green-03',
  green04: '--nsw-palette-green-04',
  teal01: '--nsw-palette-teal-01',
  teal02: '--nsw-palette-teal-02',
  teal03: '--nsw-palette-teal-03',
  teal04: '--nsw-palette-teal-04',
  black: '--nsw-palette-black',
  grey01: '--nsw-palette-grey-01',
  grey02: '--nsw-palette-grey-02',
  grey03: '--nsw-palette-grey-03',
  grey04: '--nsw-palette-grey-04',
  offWhite: '--nsw-palette-off-white',
  white: '--nsw-palette-white',
})

const defaultNswChartPalette = Object.freeze({
  blue01: '#002664',
  blue02: '#146cfd',
  blue03: '#8ce0ff',
  blue04: '#cbedfd',
  purple01: '#441170',
  purple02: '#8055f1',
  purple03: '#cebfff',
  purple04: '#e6e1fd',
  fuchsia01: '#65004d',
  fuchsia02: '#d912ae',
  fuchsia03: '#f4b5e6',
  fuchsia04: '#fddef2',
  red01: '#630019',
  red02: '#d7153a',
  red03: '#ffb8c1',
  red04: '#ffe6ea',
  orange01: '#941b00',
  orange02: '#f3631b',
  orange03: '#ffce99',
  orange04: '#fdeddf',
  brown01: '#523719',
  brown02: '#b68d5d',
  brown03: '#e8d0b5',
  brown04: '#ede3d7',
  yellow01: '#694800',
  yellow02: '#faaf05',
  yellow03: '#fde79a',
  yellow04: '#fff4cf',
  green01: '#004000',
  green02: '#00aa45',
  green03: '#a8edb3',
  green04: '#dbfadf',
  teal01: '#0b3f47',
  teal02: '#2e808e',
  teal03: '#8cdbe5',
  teal04: '#d1eeea',
  black: '#000000',
  grey01: '#22272b',
  grey02: '#495054',
  grey03: '#cdd3d6',
  grey04: '#ebebeb',
  offWhite: '#f2f2f2',
  white: '#ffffff',
})

const nswAboriginalChartPaletteTokens = Object.freeze({
  earthRed: '--nsw-aboriginal-palette-earth-red',
  emberRed: '--nsw-aboriginal-palette-ember-red',
  coralPink: '--nsw-aboriginal-palette-coral-pink',
  galahPink: '--nsw-aboriginal-palette-galah-pink',
  deepOrange: '--nsw-aboriginal-palette-deep-orange',
  orangeOchre: '--nsw-aboriginal-palette-orange-ochre',
  clayOrange: '--nsw-aboriginal-palette-clay-orange',
  sunsetOrange: '--nsw-aboriginal-palette-sunset-orange',
  bushHoneyYellow: '--nsw-aboriginal-palette-bush-honey-yellow',
  sandstoneYellow: '--nsw-aboriginal-palette-sandstone-yellow',
  goldenWattleYellow: '--nsw-aboriginal-palette-golden-wattle-yellow',
  sunbeamYellow: '--nsw-aboriginal-palette-sunbeam-yellow',
  riverbedBrown: '--nsw-aboriginal-palette-riverbed-brown',
  firewoodBrown: '--nsw-aboriginal-palette-firewood-brown',
  claystoneBrown: '--nsw-aboriginal-palette-claystone-brown',
  macadamiaBrown: '--nsw-aboriginal-palette-macadamia-brown',
  charcoalGrey: '--nsw-aboriginal-palette-charcoal-grey',
  emuGrey: '--nsw-aboriginal-palette-emu-grey',
  ashGrey: '--nsw-aboriginal-palette-ash-grey',
  smokeGrey: '--nsw-aboriginal-palette-smoke-grey',
  bushlandGreen: '--nsw-aboriginal-palette-bushland-green',
  marshlandLime: '--nsw-aboriginal-palette-marshland-lime',
  gumleafGreen: '--nsw-aboriginal-palette-gumleaf-green',
  saltbushGreen: '--nsw-aboriginal-palette-saltbush-green',
  billabongBlue: '--nsw-aboriginal-palette-billabong-blue',
  saltwaterBlue: '--nsw-aboriginal-palette-saltwater-blue',
  lightWaterBlue: '--nsw-aboriginal-palette-light-water-blue',
  coastalBlue: '--nsw-aboriginal-palette-coastal-blue',
  bushPlum: '--nsw-aboriginal-palette-bush-plum',
  spiritLilac: '--nsw-aboriginal-palette-spirit-lilac',
  lilliPilliPurple: '--nsw-aboriginal-palette-lilli-pilli-purple',
  duskPurple: '--nsw-aboriginal-palette-dusk-purple',
  black: '--nsw-aboriginal-palette-black',
  offWhite: '--nsw-aboriginal-palette-off-white',
  white: '--nsw-aboriginal-palette-white',
})

const defaultNswAboriginalChartPalette = Object.freeze({
  earthRed: '#950906',
  emberRed: '#e1261c',
  coralPink: '#fbb4b3',
  galahPink: '#fdd9d9',
  deepOrange: '#882600',
  orangeOchre: '#ee6314',
  clayOrange: '#f4aa7d',
  sunsetOrange: '#f9d4be',
  bushHoneyYellow: '#895e00',
  sandstoneYellow: '#fea927',
  goldenWattleYellow: '#fee48c',
  sunbeamYellow: '#fff1c5',
  riverbedBrown: '#552105',
  firewoodBrown: '#9e5332',
  claystoneBrown: '#d39165',
  macadamiaBrown: '#e9c8b2',
  charcoalGrey: '#272727',
  emuGrey: '#555555',
  ashGrey: '#ccc6c2',
  smokeGrey: '#e5e3e0',
  bushlandGreen: '#215834',
  marshlandLime: '#78a146',
  gumleafGreen: '#b5cda4',
  saltbushGreen: '#dae6d1',
  billabongBlue: '#00405e',
  saltwaterBlue: '#0d6791',
  lightWaterBlue: '#84c5d1',
  coastalBlue: '#c1e2e8',
  bushPlum: '#472642',
  spiritLilac: '#9a5e93',
  lilliPilliPurple: '#c99ac2',
  duskPurple: '#e4cce0',
  black: '#000000',
  offWhite: '#f2f2f2',
  white: '#ffffff',
})

const resolveCssVariables = (cssVariables, cssScope = null) => {
  if (cssVariables && typeof cssVariables.getPropertyValue === 'function') {
    return cssVariables
  }

  if (typeof getComputedStyle !== 'function' || typeof document === 'undefined') {
    return null
  }

  const scope = cssScope || document.documentElement || document.body
  if (!scope) return null
  return getComputedStyle(scope)
}

const getCssVariableColor = (cssVariables, variableName) => {
  if (!cssVariables || !variableName || !variableName.startsWith('--')) return null
  const value = cssVariables.getPropertyValue(variableName)
  if (!value || !value.trim().length) return null
  return value.trim()
}

const getPaletteByTokens = (options, tokens, defaultPalette) => {
  const {
    cssVariables = null,
    cssScope = null,
    fallbackPalette = defaultPalette,
  } = options || {}

  const resolvedCssVariables = resolveCssVariables(cssVariables, cssScope)
  const palette = {}
  Object.keys(tokens).forEach((key) => {
    const token = tokens[key]
    const fallback = fallbackPalette[key] || defaultPalette[key]
    const value = getCssVariableColor(resolvedCssVariables, token)
    palette[key] = value || fallback
  })
  return palette
}

const getNswChartPalette = (options = {}) => getPaletteByTokens(
  options,
  nswChartPaletteTokens,
  defaultNswChartPalette,
)

const getNswAboriginalChartPalette = (options = {}) => getPaletteByTokens(
  options,
  nswAboriginalChartPaletteTokens,
  defaultNswAboriginalChartPalette,
)

const resolveBaseColor = (color, cssVariables) => {
  if (!color || typeof color !== 'string') return color
  const value = color.trim()
  if (!value.startsWith('--')) return value
  return getCssVariableColor(cssVariables, value) || value
}

const normaliseInkIndexEntry = (key, entry, cssVariables) => {
  if (!entry) return null

  let baseColor = null
  let inkColor = null
  let entryMinContrast = null

  if (typeof entry === 'string') {
    inkColor = entry
  } else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    baseColor = entry.baseColor || entry.base || null
    inkColor = entry.inkColor || entry.ink || null
    if (typeof entry.minContrast === 'number') {
      entryMinContrast = entry.minContrast
    }
  }

  if (!baseColor) {
    baseColor = key.startsWith('--')
      ? getCssVariableColor(cssVariables, key)
      : key
  }

  if (!baseColor || !inkColor) return null

  const resolvedInkColor = resolveBaseColor(inkColor, cssVariables)
  if (!resolvedInkColor) return null

  const baseHex = toHexKey(baseColor)
  if (!baseHex) return null

  return {
    baseHex,
    inkColor: resolvedInkColor,
    minContrast: entryMinContrast,
  }
}

const getAccessibleInk = (baseColor, options = {}) => {
  const {
    inkIndex = defaultNswInkIndex,
    inkCandidates = defaultInkCandidates,
    minContrast = 3,
    enforceContrast = true,
    darkColor = '#22272b',
    lightColor = '#ffffff',
    cssVariables = null,
    cssScope = null,
  } = options

  const resolvedCssVariables = resolveCssVariables(cssVariables, cssScope)
  const resolvedBaseColor = resolveBaseColor(baseColor, resolvedCssVariables)
  const base = parseColorToRgba(resolvedBaseColor)
  if (!base) return darkColor

  const contrastThreshold = Number.isFinite(minContrast) ? minContrast : 3
  const candidates = []
  const addCandidate = (value) => {
    if (!value || typeof value !== 'string') return
    const resolvedValue = resolveBaseColor(value, resolvedCssVariables)
    if (!resolvedValue || candidates.includes(resolvedValue)) return
    candidates.push(resolvedValue)
  }

  let bestColor = darkColor
  let bestContrast = -1
  let accessibleColor = null
  let accessibleContrast = Number.POSITIVE_INFINITY
  const updateBest = (color, contrast) => {
    if (contrast > bestContrast) {
      bestContrast = contrast
      bestColor = color
    }
  }
  const updateAccessible = (color, contrast) => {
    if (contrast < accessibleContrast) {
      accessibleContrast = contrast
      accessibleColor = color
    }
  }

  const baseLuminance = getRelativeLuminance(base)
  const baseHex = toHexKey(resolvedBaseColor)
  if (baseHex && inkIndex && typeof inkIndex === 'object') {
    let indexedInk = null
    Object.keys(inkIndex).forEach((key) => {
      const resolved = normaliseInkIndexEntry(key, inkIndex[key], resolvedCssVariables)
      if (!resolved || resolved.baseHex !== baseHex) return
      if (!indexedInk) indexedInk = resolved.inkColor

      if (!enforceContrast) return

      const candidateRgb = parseColorToRgba(resolved.inkColor)
      if (!candidateRgb) return

      const contrast = getContrastRatio(
        baseLuminance,
        getRelativeLuminance(candidateRgb),
      )

      const requiredContrast = Math.max(
        contrastThreshold,
        Number.isFinite(resolved.minContrast) ? resolved.minContrast : 0,
      )

      if (contrast >= requiredContrast) {
        updateAccessible(resolved.inkColor, contrast)
      } else {
        updateBest(resolved.inkColor, contrast)
      }
    })

    if (!enforceContrast && indexedInk) return indexedInk
    if (accessibleColor) return accessibleColor
  }

  if (!enforceContrast) return bestColor

  if (Array.isArray(inkCandidates)) {
    inkCandidates.forEach(addCandidate)
  }

  addCandidate(lightColor)
  addCandidate(darkColor)

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i]
    const candidateRgb = parseColorToRgba(candidate)
    if (candidateRgb) {
      const contrast = getContrastRatio(baseLuminance, getRelativeLuminance(candidateRgb))
      if (contrast >= contrastThreshold) {
        updateAccessible(candidate, contrast)
      } else {
        updateBest(candidate, contrast)
      }
    }
  }

  if (accessibleColor) return accessibleColor
  return bestColor
}

const getPatternInkAlpha = (baseColor, inkColor, style, options = {}) => {
  const {
    minContrast = 3,
    baseAlphaByStyle = defaultPatternBaseAlphaByStyle,
    minAlpha = 0.35,
    maxAlpha = 1,
  } = options

  const styleKey = style === 'cross' ? 'zigzag' : style
  const styleAlpha = Number.isFinite(baseAlphaByStyle[styleKey])
    ? baseAlphaByStyle[styleKey]
    : baseAlphaByStyle.default

  const requiredAlpha = getMinimumAlphaForContrast(baseColor, inkColor, {
    minContrast,
    minAlpha,
    maxAlpha,
  })

  return clamp(Math.max(styleAlpha, requiredAlpha), minAlpha, maxAlpha)
}

const resolveContext = (input) => {
  if (!input) return null

  if (typeof CanvasRenderingContext2D !== 'undefined' && input instanceof CanvasRenderingContext2D) {
    return input
  }

  if (input.chart && input.chart.ctx) return input.chart.ctx
  if (input.ctx && input.ctx.canvas) return input.ctx
  if (input.canvas && typeof input.createPattern === 'function') return input

  return null
}

const normaliseOffset = (value, size, scale = 1) => {
  const step = Number.isFinite(scale) && scale > 0 ? scale : 1
  const snapped = Math.round(value * step) / step
  const remainder = snapped % size
  return remainder < 0 ? remainder + size : remainder
}

const getPatternOffset = (input, size, alignToElement, offsetX = 0, offsetY = 0, scale = 1) => {
  let x = offsetX
  let y = offsetY

  if (alignToElement && input && input.element) {
    const { element } = input
    x += typeof element.x === 'number' ? element.x : 0
    y += typeof element.y === 'number' ? element.y : 0

    if (typeof element.width === 'number') x -= element.width / 2
    if (typeof element.height === 'number') y -= element.height / 2
    if (typeof element.outerRadius === 'number') {
      x -= element.outerRadius
      y -= element.outerRadius
    }
  }

  return {
    x: normaliseOffset(x, size, scale),
    y: normaliseOffset(y, size, scale),
  }
}

const patternCache = new Map()
const svgImageCache = new Map()
const pendingChartUpdates = new Set()

const defaultPatternSources = Object.freeze({
  diagonal: '/assets/images/chart-pattern-diagonal-lines.svg',
  dots: '/assets/images/chart-pattern-dot-grid.svg',
  vertical: '/assets/images/chart-pattern-grid-tight.svg',
  zigzag: '/assets/images/chart-pattern-zigzag-chevron.svg',
  cross: '/assets/images/chart-pattern-cross-diagonal.svg',
  checker: '/assets/images/chart-pattern-checker-small.svg',
  grid: '/assets/images/chart-pattern-grid-wide.svg',
})

const toSvgDataUri = (svgMarkup) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`

const getSvgImageRecord = (sourceKey, source) => {
  if (svgImageCache.has(sourceKey)) return svgImageCache.get(sourceKey)
  if (typeof Image === 'undefined') {
    const fallbackRecord = { status: 'error', image: null, promise: Promise.resolve(null) }
    svgImageCache.set(sourceKey, fallbackRecord)
    return fallbackRecord
  }

  const image = new Image()
  image.decoding = 'async'

  const record = {
    status: 'loading',
    image,
    promise: null,
  }

  record.promise = new Promise((resolve) => {
    image.onload = () => {
      record.status = 'loaded'
      resolve(record)
    }
    image.onerror = () => {
      record.status = 'error'
      resolve(record)
    }
  })

  image.src = source
  svgImageCache.set(sourceKey, record)
  return record
}

const queueChartUpdate = (chart, record, sourceKey) => {
  if (!chart || !record || !record.promise) return
  const queueKey = `${chart.id || 'chart'}-${sourceKey}`
  if (pendingChartUpdates.has(queueKey)) return

  pendingChartUpdates.add(queueKey)
  record.promise.finally(() => {
    pendingChartUpdates.delete(queueKey)
    if (chart && typeof chart.update === 'function') {
      chart.update('none')
    }
  })
}

const resolveSvgSource = (svgUrl, svgMarkup) => {
  if (svgMarkup) return toSvgDataUri(svgMarkup)
  if (svgUrl) return svgUrl
  return null
}

const createPattern = (input, options = {}) => {
  const targetContext = resolveContext(input)

  const {
    style = 'diagonal',
    baseColor,
    size = 24,
    rotate = 0,
    alignToElement = false,
    offsetX = 0,
    offsetY = 0,
    tintSvg = true,
    inkColor = 'auto',
    inkIndex = defaultNswInkIndex,
    inkCandidates = defaultInkCandidates,
    minContrast = 3,
    enforceContrast = true,
    darkColor = '#22272b',
    lightColor = '#ffffff',
    inkAlpha = null,
    baseAlphaByStyle = defaultPatternBaseAlphaByStyle,
    minPatternAlpha = 0.35,
    maxPatternAlpha = 1,
    cssVariables = null,
    cssScope = null,
    dpr = null,
    patternSources = defaultPatternSources,
    svgUrl = null,
    svgMarkup = null,
    svgKey = null,
  } = options

  const resolvedCssVariables = resolveCssVariables(cssVariables, cssScope)
  const resolvedBaseColor = resolveBaseColor(baseColor, resolvedCssVariables)
  const resolvedMinPatternAlpha = clamp(
    Number.isFinite(minPatternAlpha) ? minPatternAlpha : 0.35,
    0,
    1,
  )
  const resolvedMaxPatternAlpha = clamp(
    Number.isFinite(maxPatternAlpha) ? maxPatternAlpha : 1,
    resolvedMinPatternAlpha,
    1,
  )

  if (!targetContext || !resolvedBaseColor) return baseColor

  const resolvedInk = inkColor === 'auto'
    ? getAccessibleInk(resolvedBaseColor, {
      inkIndex,
      inkCandidates,
      minContrast,
      enforceContrast,
      darkColor,
      lightColor,
      cssVariables: resolvedCssVariables,
      cssScope,
    })
    : inkColor

  const resolvedInkAlpha = Number.isFinite(inkAlpha)
    ? clamp(inkAlpha, resolvedMinPatternAlpha, resolvedMaxPatternAlpha)
    : getPatternInkAlpha(resolvedBaseColor, resolvedInk, style, {
      minContrast,
      baseAlphaByStyle,
      minAlpha: resolvedMinPatternAlpha,
      maxAlpha: resolvedMaxPatternAlpha,
    })
  const svgInk = withAlpha(resolvedInk, resolvedInkAlpha)

  let devicePixelRatio = dpr
  if (!devicePixelRatio) {
    if (input && input.chart && input.chart.currentDevicePixelRatio) {
      devicePixelRatio = input.chart.currentDevicePixelRatio
    } else if (typeof window !== 'undefined' && window.devicePixelRatio) {
      devicePixelRatio = window.devicePixelRatio
    } else {
      devicePixelRatio = 1
    }
  }

  const ratio = Math.max(1, Number(devicePixelRatio) || 1)
  const pixelWidth = Math.max(1, Math.ceil(size * ratio))
  const renderScale = pixelWidth / size
  const offset = getPatternOffset(input, size, alignToElement, offsetX, offsetY, renderScale)
  const resolvedPatternSources = patternSources && typeof patternSources === 'object'
    ? patternSources
    : defaultPatternSources
  const svgSource = resolveSvgSource(svgUrl || resolvedPatternSources[style], svgMarkup)
  const resolvedSvgKey = svgSource ? (svgKey || svgSource) : null
  if (!svgSource || !resolvedSvgKey) return resolvedBaseColor

  const cacheKey = JSON.stringify({
    style,
    baseColor: resolvedBaseColor,
    size,
    rotate: round(rotate, 2),
    alignToElement,
    offset,
    ratio: round(renderScale, 4),
    svg: resolvedSvgKey,
    tintSvg,
    svgInk,
    resolvedInkAlpha,
    minContrast,
    enforceContrast,
  })

  if (patternCache.has(cacheKey)) return patternCache.get(cacheKey)
  const record = getSvgImageRecord(resolvedSvgKey, svgSource)
  if (!record || record.status !== 'loaded' || !record.image) {
    if (input && input.chart) {
      queueChartUpdate(input.chart, record, resolvedSvgKey)
    }
    return resolvedBaseColor
  }

  if (typeof OffscreenCanvas === 'undefined' && typeof document === 'undefined') return resolvedBaseColor

  const patternCanvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(pixelWidth, pixelWidth)
    : document.createElement('canvas')

  if (typeof OffscreenCanvas === 'undefined' || !(patternCanvas instanceof OffscreenCanvas)) {
    patternCanvas.width = pixelWidth
    patternCanvas.height = pixelWidth
  }

  const patternContext = patternCanvas.getContext('2d')
  if (!patternContext) return resolvedBaseColor

  patternContext.setTransform(renderScale, 0, 0, renderScale, 0, 0)
  patternContext.clearRect(0, 0, size, size)
  patternContext.fillStyle = resolvedBaseColor
  patternContext.fillRect(0, 0, size, size)

  patternContext.save()
  patternContext.translate(-offset.x, -offset.y)
  if (rotate) {
    const radians = (rotate * Math.PI) / 180
    patternContext.translate(size / 2, size / 2)
    patternContext.rotate(radians)
    patternContext.translate(-(size / 2), -(size / 2))
  }

  patternContext.imageSmoothingEnabled = false
  if (tintSvg) {
    const overlayCanvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(pixelWidth, pixelWidth)
      : document.createElement('canvas')

    if (typeof OffscreenCanvas === 'undefined' || !(overlayCanvas instanceof OffscreenCanvas)) {
      overlayCanvas.width = pixelWidth
      overlayCanvas.height = pixelWidth
    }

    const overlayContext = overlayCanvas.getContext('2d')
    if (overlayContext) {
      overlayContext.setTransform(renderScale, 0, 0, renderScale, 0, 0)
      overlayContext.clearRect(0, 0, size, size)
      overlayContext.imageSmoothingEnabled = false
      overlayContext.drawImage(record.image, 0, 0, size, size)
      overlayContext.globalCompositeOperation = 'source-in'
      overlayContext.fillStyle = svgInk
      overlayContext.fillRect(0, 0, size, size)
      overlayContext.globalCompositeOperation = 'source-over'
      patternContext.drawImage(overlayCanvas, 0, 0, size, size)
    } else {
      patternContext.drawImage(record.image, 0, 0, size, size)
    }
  } else {
    patternContext.drawImage(record.image, 0, 0, size, size)
  }
  patternContext.restore()

  const pattern = targetContext.createPattern(patternCanvas, 'repeat') || resolvedBaseColor
  if (pattern && typeof pattern.setTransform === 'function' && renderScale !== 1) {
    if (typeof DOMMatrix !== 'undefined') {
      const matrix = new DOMMatrix()
      matrix.scaleSelf(1 / renderScale, 1 / renderScale)
      pattern.setTransform(matrix)
    }
  }
  patternCache.set(cacheKey, pattern)
  return pattern
}

const clearPatternCache = () => {
  patternCache.clear()
}

const clearSvgCache = () => {
  svgImageCache.clear()
}

const preloadSvgPattern = (source, key = null) => {
  const sourceKey = key || source
  if (!sourceKey || !source) return Promise.resolve(false)
  const record = getSvgImageRecord(sourceKey, source)
  return record.promise.then((result) => Boolean(result && result.status === 'loaded'))
}

const chartUtilities = {
  nswChartPaletteTokens,
  defaultNswChartPalette,
  nswAboriginalChartPaletteTokens,
  defaultNswAboriginalChartPalette,
  defaultNswInkIndex,
  defaultInkCandidates,
  defaultPatternBaseAlphaByStyle,
  defaultPatternSources,
  getNswChartPalette,
  getNswAboriginalChartPalette,
  parseColorToRgb,
  parseColorToRgba,
  getRelativeLuminance,
  getContrastRatio,
  getContrastAtAlpha,
  getMinimumAlphaForContrast,
  getAutoInk,
  getAccessibleInk,
  getPatternInkAlpha,
  withAlpha,
  createPattern,
  clearPatternCache,
  clearSvgCache,
  preloadSvgPattern,
}

if (typeof window !== 'undefined') {
  window.NSWChartUtilities = chartUtilities
  window.NSWChartPatterns = chartUtilities
}

export {
  nswChartPaletteTokens,
  defaultNswChartPalette,
  nswAboriginalChartPaletteTokens,
  defaultNswAboriginalChartPalette,
  defaultNswInkIndex,
  defaultInkCandidates,
  defaultPatternBaseAlphaByStyle,
  defaultPatternSources,
  getNswChartPalette,
  getNswAboriginalChartPalette,
  parseColorToRgb,
  parseColorToRgba,
  getRelativeLuminance,
  getContrastRatio,
  getContrastAtAlpha,
  getMinimumAlphaForContrast,
  getAutoInk,
  getAccessibleInk,
  getPatternInkAlpha,
  withAlpha,
  createPattern,
  clearPatternCache,
  clearSvgCache,
  preloadSvgPattern,
}

export default chartUtilities
