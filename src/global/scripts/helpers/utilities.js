// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid'

const hasWindow = typeof window !== 'undefined'
const hasDocument = typeof document !== 'undefined'

const legacyCopyText = (text) => {
  if (
    hasWindow
    && window.clipboardData
    && typeof window.clipboardData.setData === 'function'
  ) {
    try {
      return window.clipboardData.setData('Text', text)
    } catch (error) {
      return false
    }
  }

  return false
}

const commandCopyText = (text) => {
  if (!hasDocument || typeof document.execCommand !== 'function') return false

  const textarea = document.createElement('textarea')
  const { activeElement, body, documentElement } = document
  const container = body || documentElement
  let copied = false

  if (!container) return false

  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'

  container.appendChild(textarea)
  // Keep untrusted clipboard text out of the DOM construction step.
  textarea.value = text

  try {
    textarea.select()
    if (typeof textarea.setSelectionRange === 'function') {
      textarea.setSelectionRange(0, textarea.value.length)
    }
    copied = document.execCommand('copy')
  } catch (error) {
    copied = false
  } finally {
    container.removeChild(textarea)
    if (activeElement && typeof activeElement.focus === 'function') {
      try {
        activeElement.focus({ preventScroll: true })
      } catch (error) {
        activeElement.focus()
      }
    }
  }

  return copied
}

export const copyToClipboard = (text) => {
  const copyText = String(text)

  if (
    hasWindow
    && window.navigator
    && window.navigator.clipboard
    && window.isSecureContext
  ) {
    return window.navigator.clipboard.writeText(copyText)
      .then(() => true)
      .catch(() => commandCopyText(copyText) || legacyCopyText(copyText))
  }

  return Promise.resolve(commandCopyText(copyText) || legacyCopyText(copyText))
}

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
  iframe,object,embed,*:not(.is-draggable)[tabindex],
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

  if (event.key !== 'Tab' && event.keyCode !== 9) return false

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

export const validateUrl = (raw, fallback = 'https://www.google.com/webhp') => {
  try {
    if (!raw || typeof raw !== 'string') return fallback
    const trimmed = raw.trim()

    // Require absolute URL with explicit protocol; reject relative or protocol-relative
    if (!/^https?:\/\//i.test(trimmed)) return fallback

    const url = new URL(trimmed)

    // Only allow http/https protocols and disallow embedded credentials
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
      return fallback
    }

    // Return a credential-free URL (origin + path + search + hash), even if some environments would include creds in href
    return `${url.origin}${url.pathname}${url.search}${url.hash}`
  } catch (e) {
    return fallback
  }
}

export const popupWindow = (url, width, height) => {
  if (!hasWindow || typeof window.open !== 'function') return null

  const dialogWidth = Number(width) || 626
  const dialogHeight = Number(height) || 436
  let top = 0
  let left = 0

  try {
    const topWindow = window.top
    top = topWindow.outerHeight / 2 + topWindow.screenY - (dialogHeight / 2)
    left = topWindow.outerWidth / 2 + topWindow.screenX - (dialogWidth / 2)
  } catch {
    top = (window.outerHeight || dialogHeight) / 2 + (window.screenY || 0) - (dialogHeight / 2)
    left = (window.outerWidth || dialogWidth) / 2 + (window.screenX || 0) - (dialogWidth / 2)
  }

  return window.open(
    url,
    'nsw-share-dialog',
    `toolbar=no,location=no,directories=no,status=no,
    menubar=no,scrollbars=no,resizable=no,copyhistory=no,
    width=${dialogWidth},height=${dialogHeight},top=${top},left=${left},noopener,noreferrer`,
  )
}

export const setAriaDisabled = (element, isDisabled, className = 'disabled') => {
  if (!element) return
  element.setAttribute('aria-disabled', isDisabled ? 'true' : 'false')
  if (className) element.classList.toggle(className, !!isDisabled)
}

export const isAriaDisabled = (element) => element && element.getAttribute('aria-disabled') === 'true'
