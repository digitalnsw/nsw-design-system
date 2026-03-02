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
    minContrast = 4.5,
    minAlpha = 0.35,
    maxAlpha = 1,
    precision = 4,
  } = options

  const threshold = Number.isFinite(minContrast) ? minContrast : 4.5
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
  '--nsw-palette-blue-03': { baseColor: '#8ce0ff', inkColor: '#495054' },
  '--nsw-palette-blue-04': { baseColor: '#cbedfd', inkColor: '#495054' },
  '--nsw-palette-red-02': { baseColor: '#d7153a', inkColor: '#ffffff' },
  '--nsw-palette-red-04': { baseColor: '#ffe6ea', inkColor: '#495054' },
  '--nsw-palette-yellow-02': { baseColor: '#faaf05', inkColor: '#22272b' },
  '--nsw-palette-green-02': { baseColor: '#00aa45', inkColor: '#ffffff' },
  '--nsw-palette-green-04': { baseColor: '#dbfadf', inkColor: '#495054' },
  '--nsw-palette-teal-02': { baseColor: '#2e808e', inkColor: '#ffffff' },
  '--nsw-palette-purple-02': { baseColor: '#8055f1', inkColor: '#ffffff' },
  '--nsw-palette-purple-03': { baseColor: '#CEBFFF', inkColor: '#630019' },
  '--nsw-palette-orange-02': { baseColor: '#f3631b', inkColor: '#22272b' },
  '--nsw-palette-fuchsia-02': { baseColor: '#d912ae', inkColor: '#ffffff' },
  '--nsw-palette-grey-01': { baseColor: '#22272b', inkColor: '#ffffff' },
  '--nsw-palette-grey-02': { baseColor: '#495054', inkColor: '#ffffff' },
  '--nsw-palette-grey-03': { baseColor: '#cdd3d6', inkColor: '#495054' },
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
  red02: '--nsw-palette-red-02',
  red04: '--nsw-palette-red-04',
  yellow02: '--nsw-palette-yellow-02',
  green02: '--nsw-palette-green-02',
  green04: '--nsw-palette-green-04',
  teal02: '--nsw-palette-teal-02',
  purple02: '--nsw-palette-purple-02',
  purple03: '--nsw-palette-purple-03',
  orange02: '--nsw-palette-orange-02',
  fuchsia02: '--nsw-palette-fuchsia-02',
  grey01: '--nsw-palette-grey-01',
  grey02: '--nsw-palette-grey-02',
  grey03: '--nsw-palette-grey-03',
})

const defaultNswChartPalette = Object.freeze({
  blue01: '#002664',
  blue02: '#146cfd',
  blue03: '#8ce0ff',
  blue04: '#cbedfd',
  red02: '#d7153a',
  red04: '#ffe6ea',
  yellow02: '#faaf05',
  green02: '#00aa45',
  green04: '#dbfadf',
  teal02: '#2e808e',
  purple02: '#8055f1',
  purple03: '#CEBFFF',
  orange02: '#f3631b',
  fuchsia02: '#d912ae',
  grey01: '#22272b',
  grey02: '#495054',
  grey03: '#cdd3d6',
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

const getNswChartPalette = (options = {}) => {
  const {
    cssVariables = null,
    cssScope = null,
    fallbackPalette = defaultNswChartPalette,
  } = options

  const resolvedCssVariables = resolveCssVariables(cssVariables, cssScope)
  const palette = {}
  Object.keys(nswChartPaletteTokens).forEach((key) => {
    const token = nswChartPaletteTokens[key]
    const fallback = fallbackPalette[key] || defaultNswChartPalette[key]
    const value = getCssVariableColor(resolvedCssVariables, token)
    palette[key] = value || fallback
  })
  return palette
}

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
    minContrast = 4.5,
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

  const contrastThreshold = Number.isFinite(minContrast) ? minContrast : 4.5
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
    minContrast = 4.5,
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

const normaliseOffset = (value, size) => {
  const rounded = Math.round(value)
  const remainder = rounded % size
  return remainder < 0 ? remainder + size : remainder
}

const getPatternOffset = (input, size, alignToElement, offsetX = 0, offsetY = 0) => {
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
    x: normaliseOffset(x, size),
    y: normaliseOffset(y, size),
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
    minContrast = 4.5,
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

  const ratio = Math.max(1, Math.round(devicePixelRatio))
  const pixelWidth = Math.max(1, Math.round(size * ratio))
  const offset = getPatternOffset(input, size, alignToElement, offsetX, offsetY)
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
    ratio,
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

  patternContext.setTransform(ratio, 0, 0, ratio, 0, 0)
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
      overlayContext.setTransform(ratio, 0, 0, ratio, 0, 0)
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
  defaultNswInkIndex,
  defaultInkCandidates,
  defaultPatternBaseAlphaByStyle,
  defaultPatternSources,
  getNswChartPalette,
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
  defaultNswInkIndex,
  defaultInkCandidates,
  defaultPatternBaseAlphaByStyle,
  defaultPatternSources,
  getNswChartPalette,
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
