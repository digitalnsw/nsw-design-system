const changeExtention = require('./change-extention')

module.exports = function docsBreadcrumbsModel(sideNav, title, path) {
  const items = [{ text: 'Home', url: '/index.html' }]

  if (sideNav['parent-text'] && sideNav['parent-url']) {
    items.push({
      text: sideNav['parent-text'],
      url: sideNav['parent-url'],
    })
  }

  const activeGroup = (sideNav.items || []).find((item) => item.active && item.items)

  if (activeGroup && activeGroup.url && activeGroup.text !== title) {
    items.push({
      text: activeGroup.text,
      url: activeGroup.url,
    })
  }

  items.push({
    text: title,
    url: changeExtention(path),
  })

  return {
    label: 'Breadcrumbs',
    items,
  }
}
