class SideNav {
  constructor(element, index) {
    this.element = element
    this.index = index
    this.toggleButton = this.element.querySelector('.nsw-side-nav__toggle')
    this.sideNavContent = this.element.querySelector('.nsw-side-nav__content')
    this.isOpen = false
  }

  init() {
    this.element.classList.remove('open')

    if (this.sideNavContent && !this.sideNavContent.id) {
      this.sideNavContent.id = `nsw-side-nav__content-${this.index}`
    }

    if (this.toggleButton) {
      if (!this.toggleButton.querySelector('.material-icons')) {
        const icon = document.createElement('span')
        icon.classList.add('material-icons', 'nsw-material-icons')
        icon.setAttribute('focusable', 'false')
        icon.setAttribute('aria-hidden', 'true')
        icon.textContent = 'keyboard_arrow_right'
        this.toggleButton.appendChild(icon)
      }
      this.toggleButton.setAttribute('aria-controls', this.sideNavContent.id)
      this.toggleButton.addEventListener('click', this.toggle.bind(this))
    }
  }

  toggle() {
    // Disabled mobile toggle on lg screens upwards
    const isDesktop = window.innerWidth > 992
    if (isDesktop) return

    this.isOpen = !this.isOpen
    this.element.classList.toggle('open', this.isOpen)
    this.toggleButton.setAttribute('aria-expanded', String(this.isOpen))
  }
}

export default SideNav
