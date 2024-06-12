function getSign(x) {
  if (!Math.sign) {
    return ((x > 0) - (x < 0)) || +x
  }
  return Math.sign(x)
}

class SwipeContent {
  constructor(element) {
    this.element = element
    this.delta = [false, false]
    this.dragging = false
    this.intervalId = false
    this.changedTouches = false
  }

  init() {
    this.element.addEventListener('mousedown', this.handleEvent.bind(this))
    this.element.addEventListener('touchstart', this.handleEvent.bind(this), { passive: true })
  }

  initDragging() {
    this.element.addEventListener('mousemove', this.handleEvent.bind(this))
    this.element.addEventListener('touchmove', this.handleEvent.bind(this), { passive: true })
    this.element.addEventListener('mouseup', this.handleEvent.bind(this))
    this.element.addEventListener('mouseleave', this.handleEvent.bind(this))
    this.element.addEventListener('touchend', this.handleEvent.bind(this))
  }

  cancelDragging() {
    if (this.intervalId) {
      if (!window.requestAnimationFrame) {
        clearInterval(this.intervalId)
      } else {
        window.cancelAnimationFrame(this.intervalId)
      }
      this.intervalId = false
    }
    this.element.removeEventListener('mousemove', this.handleEvent.bind(this))
    this.element.removeEventListener('touchmove', this.handleEvent.bind(this))
    this.element.removeEventListener('mouseup', this.handleEvent.bind(this))
    this.element.removeEventListener('mouseleave', this.handleEvent.bind(this))
    this.element.removeEventListener('touchend', this.handleEvent.bind(this))
  }

  handleEvent(event) {
    switch (event.type) {
      case 'mousedown':
      case 'touchstart':
        this.startDrag(event)
        break
      case 'mousemove':
      case 'touchmove':
        this.drag(event)
        break
      case 'mouseup':
      case 'mouseleave':
      case 'touchend':
        this.endDrag(event)
        break
      default:
        console.log(`${event.type}.`)
    }
  }

  startDrag(event) {
    this.dragging = true
    this.initDragging()
    this.delta = [parseInt(this.unify(event).clientX, 10), parseInt(this.unify(event).clientY, 10)]
    this.emitSwipeEvents('dragStart', this.delta, event.target)
  }

  endDrag(event) {
    this.cancelDragging()

    const dx = parseInt(this.unify(event).clientX, 10)
    const dy = parseInt(this.unify(event).clientY, 10)

    if (this.delta && (this.delta[0] || this.delta[0] === 0)) {
      const s = getSign(dx - this.delta[0])

      if (Math.abs(dx - this.delta[0]) > 30) {
        if (s < 0) {
          this.emitSwipeEvents('swipeLeft', [dx, dy])
        } else {
          this.emitSwipeEvents('swipeRight', [dx, dy])
        }
      }

      this.delta[0] = false
    }
    if (this.delta && (this.delta[1] || this.delta[1] === 0)) {
      const y = getSign(dy - this.delta[1])

      if (Math.abs(dy - this.delta[1]) > 30) {
        if (y < 0) {
          this.emitSwipeEvents('swipeUp', [dx, dy])
        } else {
          this.emitSwipeEvents('swipeDown', [dx, dy])
        }
      }

      this.delta[1] = false
    }
    this.emitSwipeEvents('dragEnd', [dx, dy])
    this.dragging = false
  }

  drag(event) {
    if (!this.dragging) return

    if (!window.requestAnimationFrame) {
      this.intervalId = setTimeout(() => { this.emitDrag(event) }, 250)
    } else {
      this.intervalId = window.requestAnimationFrame(() => { this.emitDrag(event) })
    }
  }

  unify(event) {
    this.changedTouches = event.changedTouches
    return this.changedTouches ? this.changedTouches[0] : event
  }

  emitDrag(event) {
    this.emitSwipeEvents('dragging', [parseInt(this.unify(event).clientX, 10), parseInt(this.unify(event).clientY, 10)])
  }

  emitSwipeEvents(eventName, detail, el) {
    let trigger = false
    if (el) trigger = el
    const event = new CustomEvent(eventName, { detail: { x: detail[0], y: detail[1], origin: trigger } })
    this.element.dispatchEvent(event)
  }
}

export default SwipeContent
