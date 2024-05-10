import { uniqueId } from '../../global/scripts/helpers/utilities'

class ExternalLink {
  constructor(element) {
    this.link = element
    this.uID = uniqueId('external')
    this.linkIcon = this.link.querySelector('.nsw-material-icons')
    this.linkIconTitle = this.linkIcon ? this.linkIcon.getAttribute('title') : false
    this.linkElement = false
  }

  init() {
    if (this.link.tagName !== 'A') return
    this.link.classList.add('nsw-link', 'nsw-link--icon')
    this.constructor.setAttributes(this.link, {
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
      this.link.insertAdjacentElement('afterend', this.linkElement)
      this.constructor.setAttributes(this.link, {
        'aria-describedby': this.uID,
      })
    }
  }

  static setAttributes(el, attrs) {
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]))
  }
}

export default ExternalLink
