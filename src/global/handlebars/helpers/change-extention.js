/* eslint-disable */
module.exports = function (page, option, id) {
  switch (option) {
    case 'blank':
      return '/' + page.split('index.')[0] + 'blank.html'
    case 'theme':
      return '/' + page.split('index.')[0] + 'theme.html'
    case 'anchor':
      return '/' + page.split('.')[0] + '.html#' + id
    default:
      return '/' + page.split('.')[0] + '.html'
  }
}
