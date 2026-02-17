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
  <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_down</span>
  `)

  fragment.appendChild(button)

  return fragment
}

class Accordion {
  constructor(element) {
    this.element = element
    const [expandAll, collapseAll] = Array.from(this.element.querySelectorAll('.nsw-accordion__toggle button'))
    this.accordionHeadingClass = '.nsw-accordion__title'
    this.headings = this.element.querySelectorAll(this.accordionHeadingClass)
    this.expandAllBtn = expandAll
    this.collapseAllBtn = collapseAll
    this.isExpandedOnLoad = this.element.querySelectorAll('.nsw-accordion__open')
    this.buttons = []
    this.content = []
    this.toggleEvent = (event) => this.toggle(event)
    this.expandAllEvent = (event) => this.expandAll(event)
    this.collapseAllEvent = (event) => this.collapseAll(event)
  }

  init() {
    this.setUpDom()
    this.controls()
  }

  setUpDom() {
    this.element.classList.add('ready')
    if (this.collapseAllBtn) {
      this.constructor.setToggleDisabled(this.collapseAllBtn, true)
    }
    this.headings.forEach((heading) => {
      const headingElem = heading
      const contentElem = heading.nextElementSibling
      const buttonFrag = createButtons(heading)
      headingElem.textContent = ''
      headingElem.appendChild(buttonFrag)

      const buttonElem = headingElem.getElementsByTagName('button')[0]

      if (contentElem) {
        contentElem.id = buttonElem.getAttribute('aria-controls')
        contentElem.setAttribute('hidden', 'until-found')
        this.content.push(contentElem)
      }

      this.buttons.push(buttonElem)
    })

    if (this.isExpandedOnLoad) {
      this.isExpandedOnLoad.forEach((element) => {
        const openButton = element.querySelector('button')
        this.setAccordionState(openButton, 'open')
      })
    }
  }

  controls() {
    this.buttons.forEach((element) => {
      element.addEventListener('click', this.toggleEvent, false)
      element.addEventListener('beforematch', this.toggleEvent, false)
    })
    if (this.expandAllBtn && this.collapseAllBtn) {
      this.expandAllBtn.addEventListener('click', this.expandAllEvent, false)
      this.collapseAllBtn.addEventListener('click', this.collapseAllEvent, false)
    }
  }

  static setToggleDisabled(button, isDisabled) {
    if (!button) return
    button.setAttribute('aria-disabled', isDisabled ? 'true' : 'false')
    button.classList.toggle('disabled', !!isDisabled)
  }

  static isToggleDisabled(button) {
    return button && button.getAttribute('aria-disabled') === 'true'
  }

  getTargetContent(element) {
    const currentIndex = this.buttons.indexOf(element)
    return this.content[currentIndex]
  }

  setAccordionState(element, state) {
    const targetContent = this.getTargetContent(element)

    if (state === 'open') {
      element.classList.add('active')
      element.setAttribute('aria-expanded', 'true')
      targetContent.removeAttribute('hidden')
    } else if (state === 'close') {
      element.classList.remove('active')
      element.setAttribute('aria-expanded', 'false')
      targetContent.setAttribute('hidden', 'until-found')
    }
  }

  toggle(event) {
    const { currentTarget } = event
    const targetContent = this.getTargetContent(currentTarget)

    if (targetContent) {
      const isHidden = targetContent.hasAttribute('hidden')

      if (isHidden) {
        this.setAccordionState(currentTarget, 'open')
      } else {
        this.setAccordionState(currentTarget, 'close')
      }

      if (this.expandAllBtn && this.collapseAllBtn) {
        this.constructor.setToggleDisabled(this.expandAllBtn, this.content.every((item) => !item.hasAttribute('hidden')))
        this.constructor.setToggleDisabled(this.collapseAllBtn, this.content.every((item) => item.hasAttribute('hidden')))
      }
    }
  }

  expandAll(event) {
    if (event && this.constructor.isToggleDisabled(event.currentTarget)) return
    this.buttons.forEach((element) => {
      this.setAccordionState(element, 'open')
    })
    this.constructor.setToggleDisabled(this.expandAllBtn, true)
    this.constructor.setToggleDisabled(this.collapseAllBtn, false)
  }

  collapseAll(event) {
    if (event && this.constructor.isToggleDisabled(event.currentTarget)) return
    this.buttons.forEach((element) => {
      this.setAccordionState(element, 'close')
    })
    this.constructor.setToggleDisabled(this.expandAllBtn, false)
    this.constructor.setToggleDisabled(this.collapseAllBtn, true)
  }
}

export default Accordion
