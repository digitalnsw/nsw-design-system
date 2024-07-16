import SwipeContent from './swipe-content'

/* eslint-disable max-len */
class Carousel extends SwipeContent {
  constructor(element) {
    super(element)
    this.element = element
    this.containerClass = 'nsw-carousel-container'
    this.controlClass = 'js-carousel__control'
    this.wrapperClass = 'js-carousel__wrapper'
    this.counterClass = 'js-carousel__counter'
    this.counterTorClass = 'js-carousel__counter-tot'
    this.navClass = 'js-carousel__navigation'
    this.navItemClass = 'js-carousel__nav-item'
    this.navigationItemClass = this.element.getAttribute('data-navigation-item-class') ? this.element.getAttribute('data-navigation-item-class') : 'nsw-carousel__nav-item'
    this.navigationClass = this.element.getAttribute('data-navigation-class') ? this.element.getAttribute('data-navigation-class') : 'nsw-carousel__navigation'
    this.paginationClass = this.element.getAttribute('data-pagination-class') ? this.element.getAttribute('data-pagination-class') : 'nsw-carousel__navigation--pagination'
    this.draggingClass = 'nsw-carousel--is-dragging'
    this.loadedClass = 'nsw-carousel--loaded'
    this.animateClass = 'nsw-carousel__list--animating'
    this.cloneClass = 'js-clone'
    this.srClass = 'sr-only'
    this.srLiveAreaClass = 'js-carousel__aria-live'
    this.hideControlsClass = 'nsw-carousel--hide-controls'
    this.hideClass = 'nsw-display-none'
    this.centerClass = 'nsw-justify-content-center'
    this.listWrapper = this.element.querySelector(`.${this.wrapperClass}`)
    this.list = this.listWrapper ? this.listWrapper.querySelector('ol') : false
    this.items = this.list ? this.list.getElementsByTagName('li') : false
    this.controls = this.element.querySelectorAll(`.${this.controlClass}`)
    this.counter = this.element.querySelectorAll(`.${this.counterClass}`)
    this.counterTor = this.element.querySelectorAll(`.${this.counterTorClass}`)
    this.ariaLabel = this.element.getAttribute('data-description') ? this.element.getAttribute('data-description') : 'Card carousel'
    this.dragEnabled = !!((this.element.getAttribute('data-drag') && this.element.getAttribute('data-drag') === 'on'))
    this.loop = !!((this.element.getAttribute('data-loop') && this.element.getAttribute('data-loop') === 'on'))
    this.nav = !((this.element.getAttribute('data-navigation') && this.element.getAttribute('data-navigation') === 'off'))
    this.navigationPagination = !!((this.element.getAttribute('data-navigation-pagination') && this.element.getAttribute('data-navigation-pagination') === 'on'))
    this.justifyContent = !!((this.element.getAttribute('data-justify-content') && this.element.getAttribute('data-justify-content') === 'on'))
    this.initItems = []
    this.itemsNb = this.items.length
    this.visibItemsNb = 1
    this.itemsWidth = 1
    this.itemOriginalWidth = false
    this.selectedItem = 0
    this.translateContainer = 0
    this.containerWidth = 0
    this.animating = false
    this.dragStart = false
    this.resizeId = false
    this.cloneList = []
    this.itemAutoSize = false
    this.totTranslate = 0
    if (this.nav) this.loop = false
    this.flexSupported = CSS.supports('align-items', 'stretch')
    this.transitionSupported = CSS.supports('transition', 'transform')
    this.cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'))
  }

  init() {
    if (!this.items) return

    this.initCarouselLayout()
    this.setItemsWidth(true)
    this.insertBefore(this.visibItemsNb)
    this.updateCarouselClones()
    this.resetItemsTabIndex()
    this.initAriaLive()
    this.initCarouselEvents()
    this.initCarouselCounter()
  }

  initCarouselLayout() {
    this.element.classList.add(this.loadedClass)
    this.element.setAttribute('aria-roledescription', 'carousel')
    this.element.setAttribute('aria-label', this.ariaLabel)

    const itemsArray = Array.from(this.items)
    itemsArray.forEach((element, index) => {
      element.setAttribute('aria-roledescription', 'slide')
      element.setAttribute('aria-label', `${index + 1} of ${itemsArray.length}`)
      element.setAttribute('data-index', index)
    })

    this.carouselCreateContainer()

    const itemStyle = this.items && window.getComputedStyle(this.items[0])

    const containerStyle = this.listWrapper && window.getComputedStyle(this.listWrapper)
    let itemWidth = itemStyle ? parseFloat(itemStyle.getPropertyValue('width')) : 0
    const itemMargin = itemStyle ? parseFloat(itemStyle.getPropertyValue('margin-right')) : 0
    const containerPadding = containerStyle ? parseFloat(containerStyle.getPropertyValue('padding-left')) : 0
    let containerWidth = containerStyle ? parseFloat(containerStyle.getPropertyValue('width')) : 0

    if (!this.itemAutoSize) {
      this.itemAutoSize = itemWidth
    }

    containerWidth = this.getCarouselWidth(containerWidth)

    if (!this.itemOriginalWidth) {
      this.itemOriginalWidth = itemWidth
    } else {
      itemWidth = this.itemOriginalWidth
    }

    if (this.itemAutoSize) {
      this.itemOriginalWidth = parseInt(this.itemAutoSize, 10)
      itemWidth = this.itemOriginalWidth
    }

    if (containerWidth < itemWidth) {
      this.itemOriginalWidth = containerWidth
      itemWidth = this.itemOriginalWidth
    }

    this.visibItemsNb = parseInt((containerWidth - 2 * containerPadding + itemMargin) / (itemWidth + itemMargin), 10)
    this.itemsWidth = parseFloat((((containerWidth - 2 * containerPadding + itemMargin) / this.visibItemsNb) - itemMargin).toFixed(1))
    this.containerWidth = (this.itemsWidth + itemMargin) * this.items.length
    this.translateContainer = 0 - ((this.itemsWidth + itemMargin) * this.visibItemsNb)

    if (!this.flexSupported) this.list.style.width = `${(this.itemsWidth + itemMargin) * this.visibItemsNb * 3}px`

    this.totTranslate = 0 - this.selectedItem * (this.itemsWidth + itemMargin)
    if (this.items.length <= this.visibItemsNb) this.totTranslate = 0

    this.centerItems()
  }

  carouselCreateContainer() {
    if (!this.element.parentElement.classList.contains(this.containerClass)) {
      const el = document.createElement('div')
      el.classList.add(this.containerClass)
      this.element.parentNode.insertBefore(el, this.element)
      el.appendChild(this.element)
    }
  }

  setItemsWidth(bool) {
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].style.width = `${this.itemsWidth}px`
      if (bool) this.initItems.push(this.items[i])
    }
  }

  updateCarouselClones() {
    if (!this.loop) return

    if (this.items.length < this.visibItemsNb * 3) {
      this.insertAfter(this.visibItemsNb * 3 - this.items.length, this.items.length - this.visibItemsNb * 2)
    } else if (this.items.length > this.visibItemsNb * 3) {
      this.removeClones(this.visibItemsNb * 3, this.items.length - this.visibItemsNb * 3)
    }

    this.setTranslate(`translateX(${this.translateContainer}px)`)
  }

  initCarouselEvents() {
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

      this.resetCarouselControls()
      this.emitCarouselActiveItemsEvent()
    }

    if (this.dragEnabled && window.requestAnimationFrame) {
      super.init()
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

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeId)
      this.resizeId = setTimeout(() => {
        this.resetCarouselResize()
        this.resetDotsNavigation()
        this.resetCarouselControls()
        this.setCounterItem()
        this.centerItems()
        this.emitCarouselActiveItemsEvent()
      }, 250)
    })

    this.element.addEventListener('keydown', (event) => {
      if (event.key && event.key.toLowerCase() === 'arrowright') {
        this.showNextItems()
      } else if (event.key && event.key.toLowerCase() === 'arrowleft') {
        this.showPrevItems()
      } else if (event.key && event.key.toLowerCase() === 'home') {
        this.showPrevItems()
      } else if (event.key && event.key.toLowerCase() === 'end') {
        this.showNextItems()
      } else if (event.key && event.key.toLowerCase() === 'enter') {
        event.preventDefault()
        event.target.click()
      }
    })

    const itemLinks = this.element.querySelectorAll('.nsw-carousel__item a')

    if (itemLinks.length > 0) {
      itemLinks.forEach((link, index) => {
        link.addEventListener('focus', () => {
          const slider = link.closest('.js-carousel__wrapper')
          const carousel = slider.querySelector('.nsw-carousel__list')
          if (carousel) {
            link.focus({ preventScroll: true })
          }
        })

        link.addEventListener('focusout', () => {
          const item = link.closest('.nsw-carousel__item')
          const dataIndex = Number(item.getAttribute('data-index')) + 1
          if (dataIndex % this.visibItemsNb === 0 && dataIndex !== this.items.length) {
            itemLinks[index + 1].focus({ preventScroll: true })
            this.showNextItems()
          }
        })
      })
    }
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

  animateDragEnd() {
    const cb = (event) => {
      this.element.removeEventListener('dragEnd', cb)
      this.element.classList.remove(this.draggingClass)
      if (event.detail.x - this.dragStart < -40) {
        this.animating = false
        this.showNextItems()
      } else if (event.detail.x - this.dragStart > 40) {
        this.animating = false
        this.showPrevItems()
      } else if (event.detail.x - this.dragStart === 0) {
        return
      } else {
        this.animating = true
        this.animateList(`${this.translateContainer}px`, false)
      }
      this.dragStart = false
    }
    this.element.addEventListener('dragEnd', cb)
  }

  animateList(translate, direction) {
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
      this.list.dispatchEvent(new CustomEvent('transitionend'))
    }
    this.resetCarouselControls()
    this.setCounterItem()
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

  animateListCb(direction) {
    if (direction) this.updateClones(direction)
    this.animating = false
    this.resetItemsTabIndex()
  }

  updateClones(direction) {
    if (!this.loop) return
    const index = (direction === 'next') ? 0 : this.items.length - this.visibItemsNb
    this.removeClones(index, false)
    if (direction === 'next') {
      this.insertAfter(this.visibItemsNb, 0)
    } else {
      this.insertBefore(this.visibItemsNb)
    }

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

  resetCarouselResize() {
    const visibleItems = this.visibItemsNb

    this.resetItemAutoSize()
    this.initCarouselLayout()
    this.setItemsWidth(false)
    this.resetItemsWidth()
    if (this.loop) {
      if (visibleItems > this.visibItemsNb) {
        this.removeClones(0, visibleItems - this.visibItemsNb)
      } else if (visibleItems < this.visibItemsNb) {
        this.insertBefore(this.visibItemsNb, visibleItems)
      }
      this.updateCarouselClones()
    } else {
      const translate = this.noLoopTranslateValue()
      this.setTranslate(`translateX(${translate})`)
    }
    this.resetItemsTabIndex()
  }

  resetItemAutoSize() {
    if (!this.cssPropertiesSupported) return

    this.items[0].removeAttribute('style')

    this.itemAutoSize = getComputedStyle(this.items[0]).getPropertyValue('width')
  }

  resetItemsWidth() {
    this.initItems.forEach((element) => {
      const el = element
      el.style.width = `${this.itemsWidth}px`
    })
  }

  resetItemsTabIndex() {
    const carouselActive = this.items.length > this.visibItemsNb
    let j = this.items.length
    for (let i = 0; i < this.items.length; i += 1) {
      if (this.loop) {
        if (i < this.visibItemsNb || i >= 2 * this.visibItemsNb) {
          this.items[i].setAttribute('tabindex', '-1')
          this.items[i].setAttribute('aria-hidden', 'true')
          this.items[i].removeAttribute('aria-current')
        } else {
          if (i < j) j = i

          this.items[i].removeAttribute('tabindex')
          this.items[i].removeAttribute('aria-hidden')
          this.items[i].setAttribute('aria-current', 'true')
        }
      } else if ((i < this.selectedItem || i >= this.selectedItem + this.visibItemsNb) && carouselActive) {
        this.items[i].setAttribute('tabindex', '-1')
        this.items[i].setAttribute('aria-hidden', 'true')
        this.items[i].removeAttribute('aria-current')
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

  getCarouselWidth(computedWidth) {
    let comWidth = computedWidth
    const closestHidden = this.listWrapper.closest(`.${this.srClass}`)
    if (closestHidden) {
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

    clones.forEach((element) => {
      element.classList.remove(this.cloneClass)
      this.cloneList.push(element)
    })

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
    const index = Array.from(this.navDots).indexOf(dot)
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

  emitCarouselActiveItemsEvent() {
    this.emitCarouselEvents('carousel-active-items', { firstSelectedItem: this.selectedItem, visibleItemsNb: this.visibItemsNb })
  }

  emitCarouselEvents(eventName, eventDetail) {
    const event = new CustomEvent(eventName, { detail: eventDetail })
    this.element.dispatchEvent(event)
  }

  resetVisibilityOverflowItems(j) {
    const itemWidth = this.containerWidth / this.items.length
    const delta = (window.innerWidth - itemWidth * this.visibItemsNb) / 2
    const overflowItems = Math.ceil(delta / itemWidth)

    for (let i = 0; i < overflowItems; i += 1) {
      const indexPrev = j - 1 - i
      if (indexPrev >= 0) this.items[indexPrev].removeAttribute('tabindex')
      const indexNext = j + this.visibItemsNb + i
      if (indexNext < this.items.length) this.items[indexNext].removeAttribute('tabindex')
    }
  }
}

export default Carousel
