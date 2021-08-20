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
    const [expandAll, collapseAll] = Array.from(element.querySelectorAll('.nsw-accordion__toggle button'))
    this.accordionHeadingClass = '.nsw-accordion__title'
    this.accordion = element
    this.headings = element.querySelectorAll(this.accordionHeadingClass)
    this.expandAllBtn = expandAll
    this.collapseAllBtn = collapseAll
    this.buttons = []
    this.content = []
    this.toggleEvent = (e) => this.toggle(e)
    this.expandAllEvent = (e) => this.expandAll(e)
    this.collapseAllEvent = (e) => this.collapseAll(e)
  }

  init() {
    this.setUpDom()
    this.controls()
  }

  setUpDom() {
    this.accordion.classList.add('is-ready')
    if (this.collapseAllBtn) {
      this.collapseAllBtn.disabled = true
    }
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
      element.addEventListener('click', this.toggleEvent, false)
    })
    if (this.expandAllBtn && this.collapseAllBtn) {
      this.expandAllBtn.addEventListener('click', this.expandAllEvent, false)
      this.collapseAllBtn.addEventListener('click', this.collapseAllEvent, false)
    }
  }

  getTargetContent(element) {
    const currentIndex = this.buttons.indexOf(element)
    return this.content[currentIndex]
  }

  setAccordionState(element, state) {
    const targetContent = this.getTargetContent(element)

    if (state === 'open') {
      element.classList.add('is-open')
      element.setAttribute('aria-expanded', 'true')
      targetContent.hidden = false
    } else if (state === 'close') {
      element.classList.remove('is-open')
      element.setAttribute('aria-expanded', 'false')
      targetContent.hidden = true
    }
  }

  toggle(e) {
    const { currentTarget } = e
    const targetContent = this.getTargetContent(currentTarget)
    const isHidden = targetContent.hidden

    if ((isHidden)) {
      this.setAccordionState(currentTarget, 'open')
    } else {
      this.setAccordionState(currentTarget, 'close')
    }

    if (this.expandAllBtn && this.collapseAllBtn) {
      this.expandAllBtn.disabled = this.content.every((item) => item.hidden === false)
      this.collapseAllBtn.disabled = this.content.every((item) => item.hidden === true)
    }
  }

  expandAll() {
    this.buttons.forEach((element) => {
      this.setAccordionState(element, 'open')
    })
    this.expandAllBtn.disabled = true
    this.collapseAllBtn.disabled = false
  }

  collapseAll() {
    this.buttons.forEach((element) => {
      this.setAccordionState(element, 'close')
    })
    this.expandAllBtn.disabled = false
    this.collapseAllBtn.disabled = true
  }
}

export default Accordion
