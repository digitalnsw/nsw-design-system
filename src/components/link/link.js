import { uniqueId } from '../../global/scripts/helpers/utilities'

class ExternalLink {
  constructor(element) {
    this.link = element
    this.uID = uniqueId('external')
    this.linkText = this.link.innerText
    this.linkElement = false
    this.icon = false
  }

  init() {
    this.link.classList.add('nsw-link', 'nsw-link--icon')
    this.link.innerText = ''
    this.constructor.setAttributes(this.link, {
      target: '_blank',
      rel: 'noopener',
      'aria-describedby': this.uID,
    })
    this.createElement()
  }

  createElement() {
    this.linkItem = document.createElement('span')
    this.linkItem.innerText = this.linkText
    this.link.insertAdjacentElement('afterbegin', this.linkItem)
    this.linkElement = document.createElement('span')
    this.linkElement.id = this.uID
    this.linkElement.classList.add('sr-only')
    this.linkElement.innerText = '(opens in new window)'
    this.link.insertAdjacentElement('afterend', this.linkElement)
    this.icon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">open_in_new</span>'
    this.link.insertAdjacentHTML('beforeend', this.icon)
  }

  static setAttributes(el, attrs) {
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]))
  }
}

export default ExternalLink
