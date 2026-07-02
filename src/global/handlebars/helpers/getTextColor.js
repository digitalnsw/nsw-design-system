module.exports = function getTextColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') {
    return '#000000';
  }

  const hex = hexColor.trim().replace('#', '');

  // Expand 3-digit hex to 6-digit
  const normHex = hex.length === 3
    ? hex.split('').map(ch => ch + ch).join('')
    : hex;

  if (!/^([0-9a-fA-F]{6})$/.test(normHex)) {
    // Fallback if invalid
    return '#000000';
  }

  const r = parseInt(normHex.slice(0, 2), 16);
  const g = parseInt(normHex.slice(2, 4), 16);
  const b = parseInt(normHex.slice(4, 6), 16);

  // Convert sRGB to linear RGB
  const toLinear = (c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  // Relative luminance per WCAG
  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  // Contrast ratio against white and black
  const contrastWithWhite = (1.0 + 0.05) / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / (0.0 + 0.05);

  // Prefer white when BOTH meet AA (≥4.5), otherwise pick the higher ratio
  const AA = 4.5;
  if (contrastWithWhite >= AA && contrastWithBlack >= AA) {
    return '#ffffff';
  }
  return contrastWithWhite >= contrastWithBlack ? '#ffffff' : '#000000';
}
