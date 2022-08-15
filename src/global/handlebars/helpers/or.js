function isObject(thing) {
  return (typeof thing === 'object');
}

module.exports = function(...params) {
  if (isObject(params[params.length - 1])) {
    params.pop();
  }

  for (let i = 0; i < params.length; i++) {
    if (params[i]) {
      return true;
    }
  }
  return false;
}
