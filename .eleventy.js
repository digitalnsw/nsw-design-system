const eleventyNavigationPlugin = require('@11ty/eleventy-navigation')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyNavigationPlugin)

  return {
    dir: {
      input: '',
      output: 'docs/',
      layouts: '_docs/layouts',
      data: '_docs/data',
      includes: '_docs/includes'
    }
  }
}
