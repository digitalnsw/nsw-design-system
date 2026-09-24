/* eslint-disable */
module.exports = function (page, option, id) {
  switch (option) {
    case 'blank':
      return '/' + page.split('index.')[0] + 'blank.html'
    case 'theme':
      return '/' + page.split('index.')[0] + 'theme.html'
    case 'demo':
      return '/' + page.split('index.')[0] + 'demo.html'
    case 'index':
      return '/' + page.split('/').slice(0, -1).join('/') + '/index.html'
    case 'anchor':
      return '/' + page.split('.')[0] + '.html#' + id
    default:
      return '/' + page.split('.')[0] + '.html'
  }
}
