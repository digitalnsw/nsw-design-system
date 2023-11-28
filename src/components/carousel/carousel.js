import SwipeContent from './swipe-content'

/* eslint-disable no-new, max-len */
class Carousel {
  constructor(element) {
    this.element = element
    this.autoplay = !!((element.getAttribute('data-autoplay') && element.getAttribute('data-autoplay') === 'on'))
    this.autoplayInterval = (element.getAttribute('data-autoplay-interval')) ? element.getAttribute('data-autoplay-interval') : 5000
    this.autoplayOnHover = !!((element.getAttribute('data-autoplay-hover') && element.getAttribute('data-autoplay-hover') === 'on'))
    this.autoplayOnFocus = !!((element.getAttribute('data-autoplay-focus') && element.getAttribute('data-autoplay-focus') === 'on'))
    this.drag = !!((element.getAttribute('data-drag') && element.getAttribute('data-drag') === 'on'))
    this.ariaLive = true
    this.loop = !((element.getAttribute('data-loop') && element.getAttribute('data-loop') === 'off'))
    this.nav = !!((element.getAttribute('data-navigation') && element.getAttribute('data-navigation') === 'on'))
    this.navigationItemClass = element.getAttribute('data-navigation-item-class') ? element.getAttribute('data-navigation-item-class') : 'nsw-carousel__nav-item'
    this.navigationClass = element.getAttribute('data-navigation-class') ? element.getAttribute('data-navigation-class') : 'nsw-carousel__navigation'
    this.navigationPagination = !!((element.getAttribute('data-navigation-pagination') && element.getAttribute('data-navigation-pagination') === 'on'))
    this.overflowItems = !!((element.getAttribute('data-overflow-items') && element.getAttribute('data-overflow-items') === 'off'))
    this.alignControls = element.getAttribute('data-align-controls') ? element.getAttribute('data-align-controls') : false
    this.justifyContent = !!((element.getAttribute('data-justify-content') && element.getAttribute('data-justify-content') === 'on'))
    this.listWrapper = this.element.querySelector('.nsw-carousel__wrapper')
    this.list = this.element.querySelector('.nsw-carousel__list')
    this.items = this.element.getElementsByClassName('nsw-carousel__item')
    this.initItems = [] // store only the original elements - will need this for cloning
    this.itemsNb = this.items.length // original number of items
    this.visibItemsNb = 1 // tot number of visible items
    this.itemsWidth = 1 // this will be updated with the right width of items
    this.itemOriginalWidth = false // store the initial width to use it on resize
    this.selectedItem = 0 // index of first visible item
    this.translateContainer = 0 // this will be the amount the container has to be translated each time a new group has to be shown (negative)
    this.containerWidth = 0 // this will be used to store the total width of the carousel (including the overflowing part)
    this.ariaLive = false
    this.controls = this.element.querySelectorAll('.js-carousel__control') // navigation
    this.animating = false
    this.autoplayId = false // autoplay
    this.autoplayPaused = false
    this.dragStart = false // drag
    this.resizeId = false // resize
    this.cloneList = [] // used to re-initialize js
    this.itemAutoSize = false // store items min-width
    this.totTranslate = 0 // store translate value (loop = off)
    if (this.nav) this.loop = false // modify loop option if navigation is on
    this.counter = this.element.querySelectorAll('.js-carousel__counter') // store counter elements (if present)
    this.counterTor = this.element.querySelectorAll('.js-carousel__counter-tot')
    this.element.classList.add('carousel--loaded')

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
    // autoplay
    if (this.autoplay) {
      this.startAutoplay()
      // pause autoplay if user is interacting with the carousel
      if (!this.autoplayOnHover) {
        this.element.addEventListener('mouseenter', () => {
          this.pauseAutoplay()
          this.autoplayPaused = true
        })
        this.element.addEventListener('mouseleave', () => {
          this.autoplayPaused = false
          this.startAutoplay()
        })
      }
      if (!this.autoplayOnFocus) {
        this.element.addEventListener('focusin', () => {
          this.pauseAutoplay()
          this.autoplayPaused = true
        })

        this.element.addEventListener('focusout', () => {
          this.autoplayPaused = false
          this.startAutoplay()
        })
      }
    }
    // drag events
    if (this.drag && window.requestAnimationFrame) {
      // init dragging
      new SwipeContent(this.element)
      this.element.addEventListener('dragStart', (event) => {
        if (event.detail.origin && event.detail.origin.closest('.js-carousel__control')) return
        if (event.detail.origin && event.detail.origin.closest('.js-carousel__navigation')) return
        if (event.detail.origin && !event.detail.origin.closest('.nsw-carousel__wrapper')) return
        this.element.classList.add('carousel--is-dragging')
        this.pauseAutoplay()
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
      this.pauseAutoplay()
      clearTimeout(this.resizeId)
      this.resizeId = setTimeout(() => {
        this.resetCarouselResize()
        // reset dots navigation
        this.resetDotsNavigation()
        this.resetCarouselControls()
        this.setCounterItem()
        this.startAutoplay()
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
      this.element.classList.remove('carousel--is-dragging')
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
    this.pauseAutoplay()
    this.list.classList.add('nsw-carousel__list--animating')
    const initTranslate = this.totTranslate
    if (!this.loop) {
      trans = this.noLoopTranslateValue(direction)
    }
    setTimeout(() => { this.setTranslate(`translateX(${trans})`) })
    if (this.transitionSupported) {
      const cb = (event) => {
        if (event.propertyName && event.propertyName !== 'transform') return
        if (this.list) {
          this.list.classList.remove('nsw-carousel__list--animating')
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
    // reset autoplay
    this.startAutoplay()
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
      clone.classList.add('js-clone')
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
      clone.classList.add('js-clone')
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
        } else {
          if (i < j) j = i
          this.items[i].removeAttribute('tabindex')
        }
      } else if ((i < this.selectedItem || i >= this.selectedItem + this.visibItemsNb) && carouselActive) {
        this.items[i].setAttribute('tabindex', '-1')
      } else {
        if (i < j) j = i
        this.items[i].removeAttribute('tabindex')
      }
    }
    this.resetVisibilityOverflowItems(j)
  }

  startAutoplay() {
    if (this.autoplay && !this.autoplayId && !this.autoplayPaused) {
      this.autoplayId = setInterval(() => {
        this.showNextItems()
      }, this.autoplayInterval)
    }
  }

  pauseAutoplay() {
    if (this.autoplay) {
      clearInterval(this.autoplayId)
      this.autoplayId = false
    }
  }

  initAriaLive() { // create an aria-live region for SR
    if (!this.ariaLive) return
    // create an element that will be used to announce the new visible slide to SR
    const srLiveArea = document.createElement('div')
    srLiveArea.setAttribute('class', 'sr-only js-carousel__aria-live')
    srLiveArea.setAttribute('aria-live', 'polite')
    srLiveArea.setAttribute('aria-atomic', 'true')
    this.element.appendChild(srLiveArea)
    this.ariaLive = srLiveArea
  }

  updateAriaLive() { // announce to SR which items are now visible
    if (!this.ariaLive) return
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
    const closestHidden = this.listWrapper.closest('.sr-only')
    if (closestHidden) { // carousel is inside an .sr-only (visually hidden) element
      closestHidden.classList.remove('sr-only')
      comWidth = this.listWrapper.offsetWidth
      closestHidden.classList.add('sr-only')
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
      this.element.classList.add('carousel--hide-controls')
    } else {
      this.element.classList.remove('carousel--hide-controls')
    }
  }

  emitCarouselUpdateEvent() {
    this.cloneList = []
    const clones = this.element.querySelectorAll('.js-clone')
    for (let i = 0; i < clones.length; i += 1) {
      clones[i].classList.remove('js-clone')
      this.cloneList.push(clones[i])
    }
    this.emitCarouselEvents('carousel-updated', this.cloneList)
  }

  carouselCreateNavigation() {
    if (this.element.querySelectorAll('.js-carousel__navigation').length > 0) return

    const navigation = document.createElement('ol')
    let navChildren = ''

    let navClasses = `${this.navigationClass} js-carousel__navigation`
    if (this.items.length <= this.visibItemsNb) {
      navClasses += ' hide'
    }
    navigation.setAttribute('class', navClasses)

    const dotsNr = Math.ceil(this.items.length / this.visibItemsNb)
    const selectedDot = this.getSelectedDot()
    const indexClass = this.navigationPagination ? '' : 'sr-only'
    for (let i = 0; i < dotsNr; i += 1) {
      const className = (i === selectedDot) ? `class="${this.navigationItemClass} ${this.navigationItemClass}--selected js-carousel__nav-item"` : `class="${this.navigationItemClass} js-carousel__nav-item"`
      navChildren = `${navChildren}<li ${className}><button style="outline: none;"><span class="${indexClass}">${i + 1}</span></button></li>`
    }
    navigation.innerHTML = navChildren
    this.element.appendChild(navigation)
  }

  carouselInitNavigationEvents() {
    this.navigation = this.element.querySelector('.js-carousel__navigation')
    this.navDots = this.element.querySelectorAll('.js-carousel__nav-item')
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
    const dot = event.target.closest('.js-carousel__nav-item')
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
    this.list.classList.toggle('justify-center', this.items.length < this.visibItemsNb)
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
