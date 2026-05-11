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
    toggle.innerHTML = '<button aria-expanded="false" class="nsw-breadcrumbs__toggle-button" type="button"><span aria-hidden="true">…</span><span class="sr-only">Show more breadcrumbs</span></button>'

    const button = toggle.querySelector('button')
    button.addEventListener('click', () => {
      this.allBreadcrumbs.classList.add('nsw-breadcrumbs__show-all')
      button.setAttribute('aria-expanded', 'true')
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
