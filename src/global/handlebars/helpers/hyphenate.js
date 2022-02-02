module.exports = function (str, mode) {
  if (typeof str !== 'string') return ''
  return str.replace(' ', '-');
};