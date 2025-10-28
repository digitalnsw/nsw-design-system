/* eslint-disable max-len */
class Breadcrumbs {
  constructor(element) {
    this.element = element
    this.allBreadcrumbs = this.element.querySelector('.nsw-breadcrumbs ol')
    this.secondBreadcrumb = this.element.querySelector('.js-breadcrumbs li:nth-child(2)')
    this.condition = false
  }

  init() {
    if (this.allBreadcrumbs.children.length > 3) {
      this.createToggle()
    }
  }

  createToggle() {
    const toggle = this.constructor.createElement('li', ['nsw-breadcrumbs__show-more-toggle'])
    toggle.innerHTML = '<button aria-label="Show more breadcrumbs" class="nsw-breadcrumbs__toggle-button" type="button">…</button>'
    toggle.addEventListener('click', () => {
      this.allBreadcrumbs.classList.toggle('nsw-breadcrumbs__show-all')
    })

    this.allBreadcrumbs.insertBefore(toggle, this.secondBreadcrumb)
  }

  static createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag)
    if (classes.length > 0) {
      element.classList.add(...classes)
    }

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })

    return element
  }
}

export default Breadcrumbs
