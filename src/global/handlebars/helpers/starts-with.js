module.exports = function(string, prefix, options) {
  // Ensure both string and prefix exist, and check if the string starts with the prefix
  if (string && prefix && string.startsWith(prefix)) {
    return options.fn(this); // Render the block inside {{#startsWith}} ... {{/startsWith}}
  }
  return options.inverse(this); // Render the block inside {{else}} (if present)
}