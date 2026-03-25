const hasWindow = typeof window !== 'undefined'
const hasDocument = typeof document !== 'undefined'

export const copyHeadingsClass = 'js-copy-headings'

const headingSelector = 'h2'
const headingClass = 'nsw-heading-link'
const headingInitAttr = 'data-heading-link-init'
const buttonBoundAttr = 'data-heading-link-bound'
const buttonClass = 'nsw-heading-link__button'
const buttonLabel = 'Copy link to heading'
const buttonCopiedLabel = 'Copied!'
const buttonCopiedClass = 'is-copied'
const buttonTooltipHiddenClass = 'is-tooltip-hidden'
const copiedMessageDuration = 2000
const tooltipFadeDuration = 150

const buttonResetTimeouts = new WeakMap()
const buttonLabelRestoreTimeouts = new WeakMap()

function getConfiguredRoots() {
  if (!hasDocument) return []
  return Array.from(document.querySelectorAll(`.${copyHeadingsClass}`))
}

function getUsedIds() {
  const usedIds = new Set()
  const idElements = document.querySelectorAll('[id]')

  idElements.forEach((element) => {
    const id = element.getAttribute('id')
    if (id) usedIds.add(id)
  })

  return usedIds
}

function getHeadingText(heading) {
  const clone = heading.cloneNode(true)
  const existingButtons = clone.querySelectorAll(`.${buttonClass}`)

  existingButtons.forEach((button) => {
    button.remove()
  })

  return (clone.textContent || '').trim()
}

function slugifyHeading(text) {
  const slug = text
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'heading'
}

function getUniqueId(baseId, usedIds) {
  let candidate = baseId
  let suffix = 2

  while (usedIds.has(candidate)) {
    candidate = `${baseId}-${suffix}`
    suffix += 1
  }

  usedIds.add(candidate)
  return candidate
}

function ensureHeadingId(heading, usedIds) {
  const existingId = heading.getAttribute('id')
  if (existingId) {
    if (!usedIds.has(existingId)) usedIds.add(existingId)
    return existingId
  }

  const headingText = getHeadingText(heading)
  const slugBase = slugifyHeading(headingText)
  const nextId = getUniqueId(slugBase, usedIds)

  heading.setAttribute('id', nextId)
  return nextId
}

function createCopyButton(headingId) {
  const button = document.createElement('button')
  const icon = document.createElement('span')
  const srText = document.createElement('span')

  button.type = 'button'
  button.className = `nsw-icon-button ${buttonClass}`
  button.setAttribute('data-heading-id', headingId)
  button.setAttribute('data-tooltip', buttonLabel)
  button.setAttribute('aria-label', buttonLabel)

  icon.className = 'material-icons nsw-material-icons'
  icon.setAttribute('focusable', 'false')
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = 'link'

  srText.className = 'sr-only'
  srText.textContent = buttonLabel

  button.appendChild(icon)
  button.appendChild(srText)

  return button
}

function legacyCopyText(text) {
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

function commandCopyText(text) {
  if (!hasDocument || typeof document.execCommand !== 'function') return false

  let copied = false
  const onCopy = (event) => {
    if (!event.clipboardData) return
    event.preventDefault()
    event.clipboardData.setData('text/plain', text)
    copied = true
  }

  document.addEventListener('copy', onCopy, true)

  try {
    document.execCommand('copy')
  } catch (error) {
    copied = false
  } finally {
    document.removeEventListener('copy', onCopy, true)
  }

  return copied
}

function copyText(text) {
  if (
    hasWindow
    && window.navigator
    && window.navigator.clipboard
    && window.isSecureContext
  ) {
    return window.navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => commandCopyText(text) || legacyCopyText(text))
  }

  return Promise.resolve(commandCopyText(text) || legacyCopyText(text))
}

function getHeadingUrl(headingId) {
  const currentUrl = new URL(window.location.href)
  currentUrl.hash = headingId
  return currentUrl.toString()
}

function setButtonLabel(button, label) {
  const srText = button.querySelector('.sr-only')
  button.setAttribute('data-tooltip', label)
  button.setAttribute('aria-label', label)
  if (srText) srText.textContent = label
}

function resetCopiedLabel(button) {
  const existingTimeout = buttonResetTimeouts.get(button)
  if (existingTimeout) window.clearTimeout(existingTimeout)

  const existingRestoreTimeout = buttonLabelRestoreTimeouts.get(button)
  if (existingRestoreTimeout) window.clearTimeout(existingRestoreTimeout)

  const timeoutId = window.setTimeout(() => {
    button.classList.remove(buttonCopiedClass)
    button.classList.add(buttonTooltipHiddenClass)
    if (button.blur) button.blur()

    // Wait for tooltip fade-out to finish before restoring default text.
    const restoreTimeoutId = window.setTimeout(() => {
      setButtonLabel(button, buttonLabel)
    }, tooltipFadeDuration)

    buttonLabelRestoreTimeouts.set(button, restoreTimeoutId)
  }, copiedMessageDuration)

  buttonResetTimeouts.set(button, timeoutId)
}

function handleCopyClick(event) {
  const button = event.currentTarget
  const headingId = button.getAttribute('data-heading-id')
  if (!headingId) return

  const anchorUrl = getHeadingUrl(headingId)
  copyText(anchorUrl).then((copied) => {
    if (!copied) return
    button.classList.remove(buttonTooltipHiddenClass)
    setButtonLabel(button, buttonCopiedLabel)
    button.classList.add(buttonCopiedClass)
    resetCopiedLabel(button)
  })
}

function bindButton(button, headingId) {
  button.setAttribute('data-heading-id', headingId)

  if (button.getAttribute(buttonBoundAttr) === '1') return

  button.addEventListener('click', handleCopyClick)
  button.addEventListener('mouseleave', () => {
    button.classList.remove(buttonTooltipHiddenClass)
  })
  button.addEventListener('focus', () => {
    button.classList.remove(buttonTooltipHiddenClass)
  })
  button.setAttribute(buttonBoundAttr, '1')
}

function getExistingHeadingButton(heading) {
  const children = heading.children || []

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i]
    if (child.classList && child.classList.contains(buttonClass)) {
      return child
    }
  }

  return null
}

function enhanceHeading(heading, usedIds) {
  const headingId = ensureHeadingId(heading, usedIds)
  const existingButton = getExistingHeadingButton(heading)

  heading.classList.add(headingClass)

  if (existingButton) {
    bindButton(existingButton, headingId)
    heading.setAttribute(headingInitAttr, '1')
    return
  }

  const button = createCopyButton(headingId)
  bindButton(button, headingId)
  heading.appendChild(button)
  heading.setAttribute(headingInitAttr, '1')
}

export default function headingLinks() {
  if (!hasDocument) return

  const roots = getConfiguredRoots()
  if (!roots.length) return

  const usedIds = getUsedIds()

  roots.forEach((root) => {
    const headings = root.querySelectorAll(headingSelector)
    headings.forEach((heading) => {
      if (heading.getAttribute(headingInitAttr) === '1') return
      enhanceHeading(heading, usedIds)
    })
  })
}
