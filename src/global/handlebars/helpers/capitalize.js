module.exports = function (str, mode) {
  if (typeof str !== 'string') return ''
  if (mode == 'all') return str.toUpperCase()
  return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ')
};
