import { copyToClipboard } from '../../global/scripts/helpers/utilities'

const hasDocument = typeof document !== 'undefined'

export const copyHeadingsClass = 'js-copy-headings'

const headingSelector = 'h2'
const headingWrapperClass = 'nsw-heading-link'
const headingClass = 'nsw-heading-link__heading'
const headingInitAttr = 'data-heading-link-init'
const buttonBoundAttr = 'data-heading-link-bound'
const buttonClass = 'nsw-heading-link__button'
const buttonIconClass = 'nsw-heading-link__button-icon'
const buttonHeadingTextAttr = 'data-heading-text'
const tooltipClass = 'nsw-heading-link__tooltip'
const tooltipIconClass = 'nsw-heading-link__tooltip-icon'
const tooltipTextClass = 'nsw-heading-link__tooltip-text'
const buttonLabel = 'Copy link to heading'
const buttonCopiedLabel = 'Link copied'
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

function getContextualButtonLabel(label, headingText) {
  if (!headingText) return label
  return `${label}: ${headingText}`
}

function createTooltip(label) {
  const tooltip = document.createElement('span')
  const tooltipIcon = document.createElement('span')
  const tooltipText = document.createElement('span')

  tooltip.className = tooltipClass
  tooltip.setAttribute('aria-hidden', 'true')

  tooltipIcon.className = `material-icons nsw-material-icons ${tooltipIconClass}`
  tooltipIcon.setAttribute('focusable', 'false')
  tooltipIcon.setAttribute('aria-hidden', 'true')
  tooltipIcon.textContent = 'check'

  tooltipText.className = tooltipTextClass
  tooltipText.textContent = label

  tooltip.appendChild(tooltipIcon)
  tooltip.appendChild(tooltipText)

  return tooltip
}

function ensureButtonTooltip(button, label) {
  const existingIcon = button.querySelector(`.nsw-material-icons:not(.${tooltipIconClass})`)
  if (existingIcon) existingIcon.classList.add(buttonIconClass)

  if (button.querySelector(`.${tooltipClass}`)) return

  const tooltip = createTooltip(label)
  const srText = button.querySelector('.sr-only')

  button.insertBefore(tooltip, srText || null)
}

function createCopyButton(headingId, headingText) {
  const button = document.createElement('button')
  const icon = document.createElement('span')
  const srText = document.createElement('span')
  const contextualLabel = getContextualButtonLabel(buttonLabel, headingText)

  button.type = 'button'
  button.className = `nsw-icon-button ${buttonClass}`
  button.setAttribute('data-heading-id', headingId)
  button.setAttribute(buttonHeadingTextAttr, headingText)
  button.setAttribute('data-tooltip', buttonLabel)
  button.setAttribute('aria-label', contextualLabel)

  icon.className = `material-icons nsw-material-icons ${buttonIconClass}`
  icon.setAttribute('focusable', 'false')
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = 'link'

  srText.className = 'sr-only'
  srText.textContent = contextualLabel

  button.appendChild(icon)
  button.appendChild(createTooltip(buttonLabel))
  button.appendChild(srText)

  return button
}

function getHeadingUrl(headingId) {
  const currentUrl = new URL(window.location.href)
  currentUrl.hash = headingId
  return currentUrl.toString()
}

function setButtonLabel(button, label) {
  const headingText = button.getAttribute(buttonHeadingTextAttr)
  const contextualLabel = getContextualButtonLabel(label, headingText)
  const srText = button.querySelector('.sr-only')
  const tooltipText = button.querySelector(`.${tooltipTextClass}`)
  button.setAttribute('data-tooltip', label)
  button.setAttribute('aria-label', contextualLabel)
  if (tooltipText) tooltipText.textContent = label
  if (srText) srText.textContent = contextualLabel
}

function resetCopiedLabel(button) {
  const existingTimeout = buttonResetTimeouts.get(button)
  if (existingTimeout) window.clearTimeout(existingTimeout)

  const existingRestoreTimeout = buttonLabelRestoreTimeouts.get(button)
  if (existingRestoreTimeout) window.clearTimeout(existingRestoreTimeout)

  const timeoutId = window.setTimeout(() => {
    button.classList.add(buttonTooltipHiddenClass)

    // Wait for tooltip fade-out to finish before restoring default state.
    const restoreTimeoutId = window.setTimeout(() => {
      button.classList.remove(buttonCopiedClass)
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
  copyToClipboard(anchorUrl).then((copied) => {
    if (!copied) return
    button.classList.remove(buttonTooltipHiddenClass)
    setButtonLabel(button, buttonCopiedLabel)
    button.classList.add(buttonCopiedClass)
    resetCopiedLabel(button)
  })
}

function bindButton(button, headingId, headingText) {
  button.setAttribute('data-heading-id', headingId)
  button.setAttribute(buttonHeadingTextAttr, headingText)
  ensureButtonTooltip(button, buttonLabel)
  setButtonLabel(button, buttonLabel)

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

  const nextElement = heading.nextElementSibling
  if (nextElement && nextElement.classList && nextElement.classList.contains(buttonClass)) {
    return nextElement
  }

  return null
}

function getHeadingWrapper(heading) {
  const parent = heading.parentElement

  if (parent && parent.classList && parent.classList.contains(headingWrapperClass)) {
    return parent
  }

  const wrapper = document.createElement('div')
  wrapper.className = headingWrapperClass

  heading.parentNode.insertBefore(wrapper, heading)
  wrapper.appendChild(heading)

  return wrapper
}

function enhanceHeading(heading, usedIds) {
  const headingId = ensureHeadingId(heading, usedIds)
  const headingText = getHeadingText(heading)
  const existingButton = getExistingHeadingButton(heading)
  const wrapper = getHeadingWrapper(heading)

  heading.classList.remove(headingWrapperClass)
  heading.classList.add(headingClass)

  if (existingButton) {
    wrapper.appendChild(existingButton)
    bindButton(existingButton, headingId, headingText)
    heading.setAttribute(headingInitAttr, '1')
    return
  }

  const button = createCopyButton(headingId, headingText)
  bindButton(button, headingId, headingText)
  wrapper.appendChild(button)
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
