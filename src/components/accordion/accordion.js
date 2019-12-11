function Accordion(element) {
  this.accordion = element
  this.headings = element.querySelectorAll('h2')
  this.buttons = []
  this.content = []
  this.showHideEvent = (e) => this.showHide(e)
}

Accordion.prototype.init = function init() {
  // this.setUpDom()
  // this.controls()
}

Accordion.prototype.setUpDom = function setUpDom() {
  this.accordion.classList.add('js-ready')
  this.headings.forEach((heading) => {
    const headingElem = heading
    const contentElem = heading.nextElementSibling
    const buttonFrag = this.createButtons(heading)
    headingElem.textContent = ''
    headingElem.appendChild(buttonFrag)

    const buttonElem = headingElem.getElementsByTagName('button')[0]

    contentElem.hidden = true

    this.content.push(contentElem)
    this.buttons.push(buttonElem)


    // console.log(contentElem.querySelector('.nsw-accordion__body').offsetHeight)
  })
}

Accordion.prototype.createButtons = function createButtons(heading) {
  const fragment = document.createDocumentFragment()
  const button = document.createElement('button')
  button.textContent = heading.textContent
  button.setAttribute('type', 'button')
  button.setAttribute('aria-expanded', 'false')
  button.classList.add('nsw-accordion__button')
  button.insertAdjacentHTML('beforeend', `
  <svg class="nsw-icon nsw-accordion__icon" focusable="false" aria-hidden="true">
    <use xlink:href="#chevron"></use>
  </svg>
  `)

  fragment.appendChild(button)

  return fragment
}

Accordion.prototype.controls = function controls() {
  this.buttons.forEach((element) => {
    element.addEventListener('click', this.showHideEvent, false)
  })
}

Accordion.prototype.showHide = function showHide(e) {
  const { currentTarget } = e
  const currentIndex = this.buttons.indexOf(currentTarget)
  const targetContent = this.content[currentIndex]
  const isHidden = targetContent.hidden

  if (isHidden) {
    targetContent.hidden = false
  } else {
    targetContent.hidden = true
  }
}

export default Accordion
