import SwipeContent from './swipe-content'

/* eslint-disable no-new, max-len */
class Carousel {
  constructor(element) {
    // Class Names
    this.controlClass = 'js-carousel__control'
    this.wrapperClass = 'js-carousel__wrapper'
    this.counterClass = 'js-carousel__counter'
    this.counterTorClass = 'js-carousel__counter-tot'
    this.navClass = 'js-carousel__navigation'
    this.navItemClass = 'js-carousel__nav-item'
    this.navigationItemClass = element.getAttribute('data-navigation-item-class') ? element.getAttribute('data-navigation-item-class') : 'carousel__nav-item'
    this.navigationClass = element.getAttribute('data-navigation-class') ? element.getAttribute('data-navigation-class') : 'carousel__navigation'
    this.paginationClass = element.getAttribute('data-pagination-class') ? element.getAttribute('data-pagination-class') : 'carousel__navigation--pagination'
    this.draggingClass = 'carousel--is-dragging'
    this.animateClass = 'carousel__list--animating'
    this.cloneClass = 'js-clone'
    this.srClass = 'sr-only'
    this.srLiveAreaClass = 'js-carousel__aria-live'
    this.hideControlsClass = 'carousel--hide-controls'
    this.hideClass = 'nsw-display-none'
    this.centerClass = 'nsw-justify-content-center'
    // Elements in the DOM
    this.element = element
    this.listWrapper = this.element.querySelector(`.${this.wrapperClass}`)
    this.list = this.listWrapper ? this.listWrapper.querySelector('ol') : false
    this.items = this.list ? this.list.getElementsByTagName('li') : false
    this.controls = this.element.querySelectorAll(`.${this.controlClass}`)
    this.counter = this.element.querySelectorAll(`.${this.counterClass}`)
    this.counterTor = this.element.querySelectorAll(`.${this.counterTorClass}`)
    // Options
    this.ariaLabel = (element.getAttribute('data-description')) ? element.getAttribute('data-description') : 'Card carousel'
    this.drag = !((element.getAttribute('data-drag') && element.getAttribute('data-drag') === 'off'))
    this.loop = !!((element.getAttribute('data-loop') && element.getAttribute('data-loop') === 'on'))
    this.nav = !((element.getAttribute('data-navigation') && element.getAttribute('data-navigation') === 'off'))
    this.navigationPagination = !!((element.getAttribute('data-navigation-pagination') && element.getAttribute('data-navigation-pagination') === 'on'))
    this.overflowItems = !((element.getAttribute('data-overflow-items') && element.getAttribute('data-overflow-items') === 'off'))
    this.alignControls = element.getAttribute('data-align-controls') ? element.getAttribute('data-align-controls') : false
    this.justifyContent = !!((element.getAttribute('data-justify-content') && element.getAttribute('data-justify-content') === 'on'))
    // Initial Attributes
    this.initItems = [] // store only the original elements - will need this for cloning
    this.itemsNb = this.items.length // original number of items
    this.visibItemsNb = 1 // tot number of visible items
    this.itemsWidth = 1 // this will be updated with the right width of items
    this.itemOriginalWidth = false // store the initial width to use it on resize
    this.selectedItem = 0 // index of first visible item
    this.translateContainer = 0 // this will be the amount the container has to be translated each time a new group has to be shown (-)
    this.containerWidth = 0 // this will be used to store the total width of the carousel (including the overflowing part)
    this.animating = false
    this.dragStart = false // drag
    this.resizeId = false // resize
    this.cloneList = [] // used to re-initialize js
    this.itemAutoSize = false // store items min-width
    this.totTranslate = 0 // store translate value (loop = off)
    if (this.nav) this.loop = false // modify loop option if navigation is on
    // CSS Supported
    this.flexSupported = CSS.supports('align-items', 'stretch')
    this.transitionSupported = CSS.supports('transition', 'transform')
    this.cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'))
  }

  init() {
    this.initCarouselLayout() // get number visible items + width items
    this.setItemsWidth(true)
    this.insertBefore(this.visibItemsNb) // insert clones before visible elements
    this.updateCarouselClones() // insert clones after visible elements
    this.resetItemsTabIndex() // make sure not visible items are not focusable
    this.initAriaLive() // set aria-live region for SR
    this.initCarouselEvents() // listen to events
    this.initCarouselCounter()
  }

  showNext() {
    this.showNextItems()
  }

  showPrev() {
    this.showPrevItems()
  }

  initCarouselLayout() {
    this.element.classList.add('carousel--loaded')
    this.element.setAttribute('aria-roledescription', 'carousel')
    this.element.setAttribute('aria-label', this.ariaLabel)
    const itemsArray = Array.from(this.items)
    itemsArray.forEach((element, index) => {
      element.setAttribute('role', 'group')
      element.setAttribute('aria-roledescription', 'slide')
      element.setAttribute('aria-label', `${index + 1} of ${itemsArray.length}`)
    })
    // evaluate size of single elements + number of visible elements
    const itemStyle = window.getComputedStyle(this.items[0])
    const containerStyle = window.getComputedStyle(this.listWrapper)
    let itemWidth = parseFloat(itemStyle.getPropertyValue('width'))
    const itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right'))
    const containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left'))
    let containerWidth = parseFloat(containerStyle.getPropertyValue('width'))

    if (!this.itemAutoSize) {
      this.itemAutoSize = itemWidth
    }

    // if this.listWrapper is hidden -> make sure to retrieve the proper width
    containerWidth = this.getCarouselWidth(containerWidth)

    if (!this.itemOriginalWidth) { // on resize -> use initial width of items to recalculate
      this.itemOriginalWidth = itemWidth
    } else {
      itemWidth = this.itemOriginalWidth
    }

    if (this.itemAutoSize) {
      this.itemOriginalWidth = parseInt(this.itemAutoSize, 10)
      itemWidth = this.itemOriginalWidth
    }
    // make sure itemWidth is smaller than container width
    if (containerWidth < itemWidth) {
      this.itemOriginalWidth = containerWidth
      itemWidth = this.itemOriginalWidth
    }
    // get proper width of elements
    this.visibItemsNb = parseInt((containerWidth - 2 * containerPadding + itemMargin) / (itemWidth + itemMargin), 10)
    this.itemsWidth = parseFloat((((containerWidth - 2 * containerPadding + itemMargin) / this.visibItemsNb) - itemMargin).toFixed(1))
    this.containerWidth = (this.itemsWidth + itemMargin) * this.items.length
    this.translateContainer = 0 - ((this.itemsWidth + itemMargin) * this.visibItemsNb)
    // flexbox fallback
    if (!this.flexSupported) this.list.style.width = `${(this.itemsWidth + itemMargin) * this.visibItemsNb * 3}px`

    // this is used when loop == off
    this.totTranslate = 0 - this.selectedItem * (this.itemsWidth + itemMargin)
    if (this.items.length <= this.visibItemsNb) this.totTranslate = 0

    this.centerItems() // center items if this.items.length < visibItemsNb
    this.alignControlsFunc() // check if controls need to be aligned to a different element
  }

  setItemsWidth(bool) {
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].style.width = `${this.itemsWidth}px`
      if (bool) this.initItems.push(this.items[i])
    }
  }

  updateCarouselClones() {
    if (!this.loop) return
    // take care of clones after visible items (needs to run after the update of clones before visible items)
    if (this.items.length < this.visibItemsNb * 3) {
      this.insertAfter(this.visibItemsNb * 3 - this.items.length, this.items.length - this.visibItemsNb * 2)
    } else if (this.items.length > this.visibItemsNb * 3) {
      this.removeClones(this.visibItemsNb * 3, this.items.length - this.visibItemsNb * 3)
    }
    // set proper translate value for the container
    this.setTranslate(`translateX(${this.translateContainer}px)`)
  }

  initCarouselEvents() {
    // listen for click on previous/next arrow
    // dots navigation
    if (this.nav) {
      this.carouselCreateNavigation()
      this.carouselInitNavigationEvents()
    }

    if (this.controls.length > 0) {
      this.controls[0].addEventListener('click', (event) => {
        event.preventDefault()
        this.showPrevItems()
        this.updateAriaLive()
      })
      this.controls[1].addEventListener('click', (event) => {
        event.preventDefault()
        this.showNextItems()
        this.updateAriaLive()
      })

      // update arrow visility -> loop == off only
      this.resetCarouselControls()
      // emit custom event - items visible
      this.emitCarouselActiveItemsEvent()
    }

    // drag events
    if (this.drag && window.requestAnimationFrame) {
      // init dragging
      new SwipeContent(this.element)
      this.element.addEventListener('dragStart', (event) => {
        if (event.detail.origin && event.detail.origin.closest(`.${this.controlClass}`)) return
        if (event.detail.origin && event.detail.origin.closest(`.${this.navClass}`)) return
        if (event.detail.origin && !event.detail.origin.closest(`.${this.wrapperClass}`)) return
        this.element.classList.add(this.draggingClass)
        this.dragStart = event.detail.x
        this.animateDragEnd()
      })

      this.element.addEventListener('dragging', (event) => {
        if (!this.dragStart) return
        if (this.animating || Math.abs(event.detail.x - this.dragStart) < 10) return
        let translate = event.detail.x - this.dragStart + this.translateContainer
        if (!this.loop) {
          translate = event.detail.x - this.dragStart + this.totTranslate
        }
        this.setTranslate(`translateX(${translate}px)`)
      })
    }
    // reset on resize
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeId)
      this.resizeId = setTimeout(() => {
        this.resetCarouselResize()
        // reset dots navigation
        this.resetDotsNavigation()
        this.resetCarouselControls()
        this.setCounterItem()
        this.centerItems() // center items if this.items.length < visibItemsNb
        this.alignControlsFunc()
        // emit custom event - items visible
        this.emitCarouselActiveItemsEvent()
      }, 250)
    })
    // keyboard navigation
    this.element.addEventListener('keydown', (event) => {
      if (event.key && event.key.toLowerCase() === 'arrowright') {
        this.showNext()
      } else if (event.key && event.key.toLowerCase() === 'arrowleft') {
        this.showPrev()
      }
    })
  }

  showPrevItems() {
    if (this.animating) return
    this.animating = true
    this.selectedItem = this.getIndex(this.selectedItem - this.visibItemsNb)
    this.animateList('0', 'prev')
  }

  showNextItems() {
    if (this.animating) return
    this.animating = true
    this.selectedItem = this.getIndex(this.selectedItem + this.visibItemsNb)
    this.animateList(`${this.translateContainer * 2}px`, 'next')
  }

  animateDragEnd() { // end-of-dragging animation
    const cb = (event) => {
      this.element.removeEventListener('dragEnd', cb)
      this.element.classList.remove(this.draggingClass)
      if (event.detail.x - this.dragStart < -40) {
        this.animating = false
        this.showNextItems()
      } else if (event.detail.x - this.dragStart > 40) {
        this.animating = false
        this.showPrevItems()
      } else if (event.detail.x - this.dragStart === 0) { // this is just a click -> no dragging
        return
      } else { // not dragged enought -> do not update carousel, just reset
        this.animating = true
        this.animateList(`${this.translateContainer}px`, false)
      }
      this.dragStart = false
    }
    this.element.addEventListener('dragEnd', cb)
  }

  animateList(translate, direction) { // takes care of changing visible items
    let trans = translate
    this.list.classList.add(this.animateClass)
    const initTranslate = this.totTranslate
    if (!this.loop) {
      trans = this.noLoopTranslateValue(direction)
    }
    setTimeout(() => { this.setTranslate(`translateX(${trans})`) })
    if (this.transitionSupported) {
      const cb = (event) => {
        if (event.propertyName && event.propertyName !== 'transform') return
        if (this.list) {
          this.list.classList.remove(this.animateClass)
          this.list.removeEventListener('transitionend', cb)
        }

        this.animateListCb(direction)
      }

      this.list.addEventListener('transitionend', cb)
    } else {
      this.animateListCb(direction)
    }
    if (!this.loop && (initTranslate === this.totTranslate)) {
      // translate value was not updated -> trigger transitionend event to restart carousel
      this.list.dispatchEvent(new CustomEvent('transitionend'))
    }
    this.resetCarouselControls()
    this.setCounterItem()
    // emit custom event - items visible
    this.emitCarouselActiveItemsEvent()
  }

  noLoopTranslateValue(direction) {
    let translate = this.totTranslate
    if (direction === 'next') {
      translate = this.totTranslate + this.translateContainer
    } else if (direction === 'prev') {
      translate = this.totTranslate - this.translateContainer
    } else if (direction === 'click') {
      translate = this.selectedDotIndex * this.translateContainer
    }
    if (translate > 0) {
      translate = 0
      this.selectedItem = 0
    }
    if (translate < -this.translateContainer - this.containerWidth) {
      translate = -this.translateContainer - this.containerWidth
      this.selectedItem = this.items.length - this.visibItemsNb
    }
    if (this.visibItemsNb > this.items.length) translate = 0
    this.totTranslate = translate
    return `${translate}px`
  }

  animateListCb(direction) { // reset actions after carousel has been updated
    if (direction) this.updateClones(direction)
    this.animating = false
    // reset tab index
    this.resetItemsTabIndex()
  }

  updateClones(direction) {
    if (!this.loop) return
    // at the end of each animation, we need to update the clones before and after the visible items
    const index = (direction === 'next') ? 0 : this.items.length - this.visibItemsNb
    // remove clones you do not need anymore
    this.removeClones(index, false)
    // add new clones
    if (direction === 'next') {
      this.insertAfter(this.visibItemsNb, 0)
    } else {
      this.insertBefore(this.visibItemsNb)
    }
    // reset transform
    this.setTranslate(`translateX(${this.translateContainer}px)`)
  }

  insertBefore(nb, delta) {
    if (!this.loop) return
    const clones = document.createDocumentFragment()
    let start = 0
    if (delta) start = delta
    for (let i = start; i < nb; i += 1) {
      const index = this.getIndex(this.selectedItem - i - 1)
      const clone = this.initItems[index].cloneNode(true)
      clone.classList.add(this.cloneClass)
      clones.insertBefore(clone, clones.firstChild)
    }
    this.list.insertBefore(clones, this.list.firstChild)
    this.emitCarouselUpdateEvent()
  }

  insertAfter(nb, init) {
    if (!this.loop) return
    const clones = document.createDocumentFragment()
    for (let i = init; i < nb + init; i += 1) {
      const index = this.getIndex(this.selectedItem + this.visibItemsNb + i)
      const clone = this.initItems[index].cloneNode(true)
      clone.classList.add(this.cloneClass)
      clones.appendChild(clone)
    }
    this.list.appendChild(clones)
    this.emitCarouselUpdateEvent()
  }

  removeClones(index, bool) {
    let newBool = bool
    if (!this.loop) return
    if (!bool) {
      newBool = this.visibItemsNb
    }
    for (let i = 0; i < newBool; i += 1) {
      if (this.items[index]) this.list.removeChild(this.items[index])
    }
  }

  resetCarouselResize() { // reset carousel on resize
    const visibleItems = this.visibItemsNb
    // get new items min-width value
    this.resetItemAutoSize()
    this.initCarouselLayout()
    this.setItemsWidth(false)
    this.resetItemsWidth() // update the array of original items -> array used to create clones
    if (this.loop) {
      if (visibleItems > this.visibItemsNb) {
        this.removeClones(0, visibleItems - this.visibItemsNb)
      } else if (visibleItems < this.visibItemsNb) {
        this.insertBefore(this.visibItemsNb, visibleItems)
      }
      this.updateCarouselClones() // this will take care of translate + after elements
    } else {
      // reset default translate to a multiple value of (itemWidth + margin)
      const translate = this.noLoopTranslateValue()
      this.setTranslate(`translateX(${translate})`)
    }
    this.resetItemsTabIndex() // reset focusable elements
  }

  resetItemAutoSize() {
    if (!this.cssPropertiesSupported) return
    // remove inline style
    this.items[0].removeAttribute('style')
    // get original item width
    this.itemAutoSize = getComputedStyle(this.items[0]).getPropertyValue('width')
  }

  resetItemsWidth() {
    for (let i = 0; i < this.initItems.length; i += 1) {
      this.initItems[i].style.width = `${this.itemsWidth}px`
    }
  }

  resetItemsTabIndex() {
    const carouselActive = this.items.length > this.visibItemsNb
    let j = this.items.length
    for (let i = 0; i < this.items.length; i += 1) {
      if (this.loop) {
        if (i < this.visibItemsNb || i >= 2 * this.visibItemsNb) {
          this.items[i].setAttribute('tabindex', '-1')
          this.items[i].setAttribute('aria-hidden', 'true')
        } else {
          if (i < j) j = i
          this.items[i].removeAttribute('tabindex')
          this.items[i].removeAttribute('aria-hidden')
          this.items[i].setAttribute('aria-current', 'true')
        }
      } else if ((i < this.selectedItem || i >= this.selectedItem + this.visibItemsNb) && carouselActive) {
        this.items[i].setAttribute('tabindex', '-1')
        this.items[i].setAttribute('aria-hidden', 'true')
      } else {
        if (i < j) j = i
        this.items[i].removeAttribute('tabindex')
        this.items[i].removeAttribute('aria-hidden')
        this.items[i].setAttribute('aria-current', 'true')
      }
    }
    this.resetVisibilityOverflowItems(j)
  }

  initAriaLive() {
    // create an element that will be used to announce the new visible slide to SR
    const srLiveArea = document.createElement('div')
    srLiveArea.setAttribute('class', `${this.srClass} ${this.srLiveAreaClass}`)
    srLiveArea.setAttribute('aria-live', 'polite')
    srLiveArea.setAttribute('aria-atomic', 'true')
    this.element.appendChild(srLiveArea)
    this.ariaLive = srLiveArea
  }

  updateAriaLive() {
    this.ariaLive.innerHTML = `Item ${this.selectedItem + 1} selected. ${this.visibItemsNb} items of ${this.initItems.length} visible`
  }

  getIndex(index) {
    let i = index
    if (i < 0) i = this.getPositiveValue(i, this.itemsNb)
    if (i >= this.itemsNb) i %= this.itemsNb
    return i
  }

  getPositiveValue(value, add) {
    let val = value
    val += add
    if (val > 0) return val
    return this.getPositiveValue(val, add)
  }

  setTranslate(translate) {
    this.list.style.transform = translate
    this.list.style.msTransform = translate
  }

  getCarouselWidth(computedWidth) { // retrieve carousel width if carousel is initially hidden
    let comWidth = computedWidth
    const closestHidden = this.listWrapper.closest(`.${this.srClass}`)
    if (closestHidden) { // carousel is inside an .sr-only (visually hidden) element
      closestHidden.classList.remove(this.srClass)
      comWidth = this.listWrapper.offsetWidth
      closestHidden.classList.add(this.srClass)
    } else if (Number.isNaN(comWidth)) {
      comWidth = this.getHiddenParentWidth(this.element)
    }
    return comWidth
  }

  getHiddenParentWidth(element) {
    const parent = element.parentElement
    if (parent.tagName.toLowerCase() === 'html') return 0
    const style = window.getComputedStyle(parent)
    if (style.display === 'none' || style.visibility === 'hidden') {
      parent.setAttribute('style', 'display: block!important; visibility: visible!important;')
      const computedWidth = this.listWrapper.offsetWidth
      parent.style.display = ''
      parent.style.visibility = ''
      return computedWidth
    }
    return this.getHiddenParentWidth(parent)
  }

  resetCarouselControls() {
    if (this.loop) return
    // update arrows status
    if (this.controls.length > 0) {
      if (this.totTranslate === 0) {
        this.controls[0].setAttribute('disabled', true)
      } else {
        this.controls[0].removeAttribute('disabled')
      }

      if (this.totTranslate === (-this.translateContainer - this.containerWidth) || this.items.length <= this.visibItemsNb) {
        this.controls[1].setAttribute('disabled', true)
      } else {
        this.controls[1].removeAttribute('disabled')
      }
    }
    // update carousel dots
    if (this.nav) {
      const selectedDot = this.navigation.querySelectorAll(`.${this.navigationItemClass}--selected`)
      if (selectedDot.length > 0) selectedDot[0].classList.remove(`${this.navigationItemClass}--selected`)

      let newSelectedIndex = this.getSelectedDot()
      if (this.totTranslate === (-this.translateContainer - this.containerWidth)) {
        newSelectedIndex = this.navDots.length - 1
      }
      this.navDots[newSelectedIndex].classList.add(`${this.navigationItemClass}--selected`)
    }

    if (this.totTranslate === 0 && (this.totTranslate === (-this.translateContainer - this.containerWidth) || this.items.length <= this.visibItemsNb)) {
      this.element.classList.add(this.hideControlsClass)
    } else {
      this.element.classList.remove(this.hideControlsClass)
    }
  }

  emitCarouselUpdateEvent() {
    this.cloneList = []
    const clones = this.element.querySelectorAll(`.${this.cloneClass}`)
    for (let i = 0; i < clones.length; i += 1) {
      clones[i].classList.remove(this.cloneClass)
      this.cloneList.push(clones[i])
    }
    this.emitCarouselEvents('carousel-updated', this.cloneList)
  }

  carouselCreateNavigation() {
    if (this.element.querySelectorAll(`.${this.navClass}`).length > 0) return

    const navigation = document.createElement('ol')
    let navChildren = ''

    let navClasses = ''

    if (this.navigationPagination) {
      navClasses = `${this.navigationClass} ${this.paginationClass} ${this.navClass}`
    } else {
      navClasses = `${this.navigationClass} ${this.navClass}`
    }

    if (this.items.length <= this.visibItemsNb) {
      navClasses += ` ${this.hideClass}`
    }
    navigation.setAttribute('class', navClasses)

    const dotsNr = Math.ceil(this.items.length / this.visibItemsNb)
    const selectedDot = this.getSelectedDot()
    const indexClass = this.navigationPagination ? '' : this.srClass
    for (let i = 0; i < dotsNr; i += 1) {
      const className = (i === selectedDot) ? `class="${this.navigationItemClass} ${this.navigationItemClass}--selected ${this.navItemClass}"` : `class="${this.navigationItemClass} ${this.navItemClass}"`
      navChildren = `${navChildren}<li ${className}><button><span class="${indexClass}">${i + 1}</span></button></li>`
    }
    navigation.innerHTML = navChildren
    this.element.appendChild(navigation)
  }

  carouselInitNavigationEvents() {
    this.navigation = this.element.querySelector(`.${this.navClass}`)
    this.navDots = this.element.querySelectorAll(`.${this.navItemClass}`)
    this.navIdEvent = this.carouselNavigationClick.bind(this)
    this.navigation.addEventListener('click', this.navIdEvent)
  }

  carouselRemoveNavigation() {
    if (this.navigation) this.element.removeChild(this.navigation)
    if (this.navIdEvent) this.navigation.removeEventListener('click', this.navIdEvent)
  }

  resetDotsNavigation() {
    if (!this.nav) return
    this.carouselRemoveNavigation()
    this.carouselCreateNavigation()
    this.carouselInitNavigationEvents()
  }

  carouselNavigationClick(event) {
    const dot = event.target.closest(`.${this.navItemClass}`)
    if (!dot) return
    if (this.animating) return
    this.animating = true
    const index = Array.prototype.indexOf.call(this.navDots, dot)
    this.selectedDotIndex = index
    this.selectedItem = index * this.visibItemsNb
    this.animateList(false, 'click')
  }

  getSelectedDot() {
    return Math.ceil(this.selectedItem / this.visibItemsNb)
  }

  initCarouselCounter() {
    if (this.counterTor.length > 0) this.counterTor[0].textContent = this.itemsNb
    this.setCounterItem()
  }

  setCounterItem() {
    if (this.counter.length === 0) return
    let totalItems = this.selectedItem + this.visibItemsNb
    if (totalItems > this.items.length) totalItems = this.items.length
    this.counter[0].textContent = totalItems
  }

  centerItems() {
    if (!this.justifyContent) return
    this.list.classList.toggle(this.centerClass, this.items.length < this.visibItemsNb)
  }

  alignControlsFunc() {
    if (this.controls.length < 1 || !this.alignControls) return
    if (!this.controlsAlignEl) {
      this.controlsAlignEl = this.element.querySelector(this.alignControls)
    }
    if (!this.controlsAlignEl) return
    const translate = (this.element.offsetHeight - this.controlsAlignEl.offsetHeight)
    for (let i = 0; i < this.controls.length; i += 1) {
      this.controls[i].style.marginBottom = `${translate}px`
    }
  }

  emitCarouselActiveItemsEvent() {
    this.emitCarouselEvents('carousel-active-items', { firstSelectedItem: this.selectedItem, visibleItemsNb: this.visibItemsNb })
  }

  emitCarouselEvents(eventName, eventDetail) {
    const event = new CustomEvent(eventName, { detail: eventDetail })
    this.element.dispatchEvent(event)
  }

  resetVisibilityOverflowItems(j) {
    if (!this.overflowItems) return
    const itemWidth = this.containerWidth / this.items.length
    const delta = (window.innerWidth - itemWidth * this.visibItemsNb) / 2
    const overflowItems = Math.ceil(delta / itemWidth)

    for (let i = 0; i < overflowItems; i += 1) {
      const indexPrev = j - 1 - i // prev element
      if (indexPrev >= 0) this.items[indexPrev].removeAttribute('tabindex')
      const indexNext = j + this.visibItemsNb + i // next element
      if (indexNext < this.items.length) this.items[indexNext].removeAttribute('tabindex')
    }
  }
}

export default Carousel
