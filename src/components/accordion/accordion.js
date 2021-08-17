import { uniqueId } from '../../global/scripts/helpers/utilities'

function createButtons({ textContent }) {
  const fragment = document.createDocumentFragment()
  const button = document.createElement('button')
  const uID = uniqueId('accordion')
  button.textContent = textContent
  button.setAttribute('type', 'button')
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('aria-controls', uID)
  button.classList.add('nsw-accordion__button')
  button.insertAdjacentHTML('beforeend', `
  <i class="material-icons nsw-material-icons nsw-accordion__icon" focusable="false" aria-hidden="true">keyboard_arrow_right</i>
  `)

  fragment.appendChild(button)

  return fragment
}

class Accordion {
  constructor(element) {
    this.accordionHeadingClass = '.nsw-accordion__title'
    this.accordion = element
    this.headings = element.querySelectorAll(this.accordionHeadingClass)
    this.toggleButtons = element.querySelectorAll('.nsw-accordion__toggle button')
    this.buttons = []
    this.content = []
    this.showHideEvent = (e) => this.showHide(e)
    this.toggleAllEvent = (e) => this.toggleAll(e)
  }

  init() {
    this.setUpDom()
    this.controls()
  }

  setUpDom() {
    this.accordion.classList.add('is-ready')
    this.headings.forEach((heading) => {
      const headingElem = heading
      const contentElem = heading.nextElementSibling
      const buttonFrag = createButtons(heading)
      headingElem.textContent = ''
      headingElem.appendChild(buttonFrag)

      const buttonElem = headingElem.getElementsByTagName('button')[0]

      contentElem.id = buttonElem.getAttribute('aria-controls')
      contentElem.hidden = true

      this.content.push(contentElem)
      this.buttons.push(buttonElem)
    })
  }

  controls() {
    this.buttons.forEach((element) => {
      element.addEventListener('click', this.showHideEvent, false)
    })
    this.toggleButtons.forEach((element) => {
      element.addEventListener('click', this.toggleAllEvent, false)
    })
  }

  toggle(element) {
    const currentIndex = this.buttons.indexOf(element)
    const targetContent = this.content[currentIndex]
    const isHidden = targetContent.hidden

    if (isHidden) {
      element.classList.add('is-open')
      element.setAttribute('aria-expanded', 'true')
      targetContent.hidden = false
    } else {
      element.classList.remove('is-open')
      element.setAttribute('aria-expanded', 'false')
      targetContent.hidden = true
    }
  }

  showHide(e) {
    const { currentTarget } = e
    this.toggle(currentTarget)
  }

  toggleAll() {
    this.buttons.forEach((element) => {
      this.toggle(element)
    })
    const isExpand = this.toggleButtons[0]
    const isCollapse = this.toggleButtons[1]

    const isExpandDisabled = isExpand.disabled
    if (isExpandDisabled) {
      isExpand.disabled = false
      isCollapse.disabled = true
    } else {
      isExpand.disabled = true
      isCollapse.disabled = false
    }
  }
}

export default Accordion
