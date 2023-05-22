// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid'

export const uniqueId = (prefix) => {
  const prefixValue = (prefix === undefined ? 'nsw' : prefix)
  const uuid = uuidv4()
  return `${prefixValue}-${uuid}`
}

export const focusObjectGenerator = (arr) => {
  const focusableElements = {
    all: arr,
    first: arr[0],
    last: arr[arr.length - 1],
    length: arr.length,
  }

  return focusableElements
}

export const getFocusableElement = (el) => {
  const elementArr = [].slice.call(el.querySelectorAll(`a[href],button:not([disabled]),
  area[href],input:not([disabled]):not([type=hidden]),
  select:not([disabled]),textarea:not([disabled]),
  iframe,object,embed,*:not(.is-draggabe)[tabindex],
  *[contenteditable]`))

  return focusObjectGenerator(elementArr)
}

export const getFocusableElementBySelector = (id, selectorArr) => {
  const elements = []
  for (let i = 0; i < selectorArr.length; i += 1) {
    elements.push([].slice.call(document.querySelectorAll(`#${id} ${selectorArr[i]}`)))
  }

  const mergedElementArr = [].concat(...elements)

  return focusObjectGenerator(mergedElementArr)
}

export const trapTabKey = (event, focusObject) => {
  const { activeElement } = document
  const focusableElement = focusObject

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
