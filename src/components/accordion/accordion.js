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
    this.buttons = []
    this.content = []
    this.showHideEvent = (e) => this.showHide(e)
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
  }

  showHide(e) {
    const { currentTarget } = e
    const currentIndex = this.buttons.indexOf(currentTarget)
    const targetContent = this.content[currentIndex]
    const isHidden = targetContent.hidden

    if (isHidden) {
      currentTarget.classList.add('is-open')
      currentTarget.setAttribute('aria-expanded', 'true')
      targetContent.hidden = false
    } else {
      currentTarget.classList.remove('is-open')
      currentTarget.setAttribute('aria-expanded', 'false')
      targetContent.hidden = true
    }
  }
}

export default Accordion
