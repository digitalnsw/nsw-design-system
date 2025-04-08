export default function stickyContainer() {
  let containerEl = document.querySelector('.js-sticky-container')
  if (!containerEl) {
    containerEl = document.createElement('div')
    containerEl.className = 'js-sticky-container'
    containerEl.id = 'sticky-container'
    containerEl.style.position = 'fixed'
    containerEl.style.bottom = '0'
    containerEl.style.left = '0'
    containerEl.style.width = '100%'
    containerEl.style.zIndex = '9900'
    document.body.appendChild(containerEl)
  }
  return containerEl
}
