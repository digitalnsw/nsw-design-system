module.exports = function () {
  return Array.prototype.slice.call(arguments, 0, -1).some(Boolean)
}
