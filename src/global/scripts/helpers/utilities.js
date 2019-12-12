export const getFocusableElement = (el) => {
  const focusable = el.querySelectorAll(
    `a[href],button:not([disabled]),
    area[href],input:not([disabled]):not([type=hidden]),
    select:not([disabled]),textarea:not([disabled]),
    iframe,object,embed,*:not(.is-draggabe)[tabindex],
    *[contenteditable]`,
  )
  const slicedFocusable = Array.prototype.slice.call(focusable)
  const focusableArray = []

  for (let i = 0; i < slicedFocusable.length; i += 1) {
    if (slicedFocusable[i].offsetHeight !== 0) focusableArray.push(slicedFocusable[i])
  }

  const focusableElement = {
    all: focusableArray,
    first: focusableArray[0],
    last: focusableArray[focusableArray.length - 1],
    length: focusableArray.length,
  }

  return focusableElement
}

export const trapTabKey = (event, container) => {
  const { activeElement } = document
  const focusableElement = getFocusableElement(container)

  if (event.keyCode !== 9) return false

  if (focusableElement.length === 1) {
    event.preventDefault()
  } else if (event.shiftKey && activeElement === focusableElement.first) {
    focusableElement.last.focus()
    event.preventDefault()
  } else if (!event.shiftKey && activeElement === focusableElement.last) {
    focusableElement.first.focus()
    event.preventDefault()
  }

  return true
}

export const whichTransitionEvent = () => {
  const el = document.createElement('fakeelement')
  const transitions = {
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd',
  }

  const found = Object.keys(transitions).filter((key) => el.style[key] !== undefined)
  return transitions[found[0]]
}

export const uniqueId = (prefix) => {
  const prefixValue = (prefix === undefined ? 'nsw' : prefix)
  return `${prefixValue}-${Math.random().toString(36)
    .substr(2, 16)}`
}

export const popupWindow = (url, width, height) => {
  const y = window.top.outerHeight / 2 + window.top.screenY - (height / 2)
  const x = window.top.outerWidth / 2 + window.top.screenX - (width / 2)

  window.open(
    url,
    '',
    `toolbar=no,location=no,directories=no, status=no,
    menubar=no, scrollbars=no, resizable=no, copyhistory=no,
    width=${width}, height=${height}, top=${y}, left=${x}`,
  )
}
