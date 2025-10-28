import { uniqueId } from '../../global/scripts/helpers/utilities'

class ExternalLink {
  constructor(element) {
    this.element = element
    this.uID = uniqueId('external')
    this.linkIcon = this.element.querySelector('.nsw-material-icons')
    this.linkIconTitle = this.linkIcon ? this.linkIcon.getAttribute('title') : false
    this.linkElement = false
  }

  init() {
    if (this.element.tagName !== 'A') return
    this.element.classList.add('nsw-link', 'nsw-link--icon')
    this.constructor.setAttributes(this.element, {
      target: '_blank',
      rel: 'noopener',
    })
    if (this.linkIcon) {
      this.constructor.setAttributes(this.linkIcon, {
        focusable: 'false',
        'aria-hidden': 'true',
      })
    }
    if (this.linkIconTitle) this.createElement(this.linkIconTitle)
  }

  createElement(title) {
    if (title) {
      this.linkElement = document.createElement('span')
      this.linkElement.id = this.uID
      this.linkElement.classList.add('sr-only')
      this.linkElement.innerText = title
      this.element.insertAdjacentElement('afterend', this.linkElement)
      this.constructor.setAttributes(this.element, {
        'aria-describedby': this.uID,
      })
    }
  }

  static setAttributes(el, attrs) {
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]))
  }
}

export default ExternalLink
