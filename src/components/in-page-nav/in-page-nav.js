import { uniqueId } from '../../global/scripts/helpers/utilities'

class InPageNav {
  constructor(element) {
    this.nav = element
    this.navTitle = this.nav.getAttribute('data-title')
    this.h2Elements = this.nav.querySelectorAll('h2')
    this.text = false
  }

  init() {
    this.h2Elements.forEach((h2) => {
      h2.setAttribute('id', this.constructor.createKebabCase(h2.innerText))
      this.constructor.createCopyAnchor(h2)
      h2.addEventListener('click', () => {
        this.copyLink(h2.id)
      })
    })
    this.createInPageNav()
  }

  createInPageNav() {
    const uID = uniqueId('in-page-nav')

    const nav = document.createElement('nav')
    nav.classList.add('nsw-in-page-nav')
    nav.setAttribute('aria-labelledby', uID)

    const title = document.createElement('div')
    title.classList.add('nsw-in-page-nav__title')
    title.setAttribute('id', uID)
    title.innerText = this.navTitle
    nav.appendChild(title)

    const ul = document.createElement('ul')

    const listItems = Array.from(this.h2Elements).reduce((result, h2) => {
      let li = result
      li += `<li><a href="#${h2.id}">${h2.innerText}</a></li>`
      return li
    }, '')

    ul.innerHTML = listItems
    nav.appendChild(ul)
    this.nav.insertAdjacentElement('beforebegin', nav)
  }

  copyLink(id) {
    const span = this.nav.querySelector(`#${id}`)
    this.text = span.querySelector('span:not(.nsw-material-icons)')
    const url = window.location.href.includes('#') ? window.location.href.split('#')[0] : window.location.href
    const urlHash = `${url}#${id}`

    if (!navigator.clipboard) {
      const input = document.createElement('input')
      input.setAttribute('value', urlHash)
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.copiedMessage()
    } else {
      navigator.clipboard.writeText(urlHash).then(() => {
        this.copiedMessage()
      })
    }
  }

  copiedMessage() {
    this.text.innerText = ' Copied'
    setTimeout(() => {
      this.text.innerText = ''
    }, 3000)
  }

  static createCopyAnchor(element) {
    element.classList.add('nsw-copy-anchor')

    const button = document.createElement('button')
    button.classList.add('nsw-icon-button')

    const span = document.createElement('span')
    span.classList.add('material-icons', 'nsw-material-icons')
    span.setAttribute('focusable', 'false')
    span.setAttribute('aria-hidden', 'true')
    span.innerText = 'link'

    const textSpan = document.createElement('span')
    textSpan.innerText = ''

    button.appendChild(span)
    element.appendChild(button)
    element.appendChild(textSpan)
  }

  static createKebabCase(str) {
    const invalidBeginning = /^([0-9]|--|-[0-9])/

    if (typeof str !== 'string') {
      return ''
    }

    const strippedName = str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((x) => x.toLowerCase())
      .join('-')

    return invalidBeginning.test(strippedName)
      ? `_${strippedName}`
      : strippedName
  }
}

export default InPageNav
