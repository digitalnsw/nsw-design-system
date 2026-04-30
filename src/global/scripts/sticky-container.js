const HAS_WINDOW = typeof window !== 'undefined'
const HAS_DOCUMENT = typeof document !== 'undefined'

/**
 * Sticky container (singleton)
 * - Prefer a manually-authored container in <body>.
 * - If none exists, create one as the last child of <body>.
 * - Always expose `.js-sticky-container` and `#sticky-container` for other modules.
 * - Keep body padding in sync with the container height.
 */

export const STICKY_CLASS = 'js-sticky-container'
export const STICKY_ID = 'sticky-container'

const CANDIDATES = [
  '.nsw-sticky-container',
  `.${STICKY_CLASS}`,
  `#${STICKY_ID}`,
]

function findManualContainer() {
  if (!HAS_DOCUMENT) return null
  for (let i = 0; i < CANDIDATES.length; i += 1) {
    const el = document.querySelector(CANDIDATES[i])
    if (el) return el
  }
  return null
}

export function updateStickyBodyPadding() {
  if (!HAS_DOCUMENT) return
  const el = document.querySelector(`.${STICKY_CLASS}`)
  if (!el) return
  const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { height: el.offsetHeight || 0 }
  const h = Math.max(0, Math.round(rect.height || 0))
  document.body.style.setProperty('--nsw-sticky-height', `${h}px`)
  document.body.style.paddingBlockEnd = `${h}px`
}

function attachObservers(el) {
  const node = el
  if (!HAS_WINDOW || !node || node.getAttribute('data-sticky-observed') === '1') return
  try {
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => updateStickyBodyPadding())
      ro.observe(node)
    } else {
      window.addEventListener('resize', updateStickyBodyPadding)
    }
    if (window.MutationObserver) {
      const mo = new MutationObserver(() => updateStickyBodyPadding())
      mo.observe(node, { childList: true, subtree: true })
    }
  } catch (err) {
    // observers are optional
  }
  node.setAttribute('data-sticky-observed', '1')
}

export default function stickyContainer() {
  if (!HAS_DOCUMENT) return null

  // 1) Prefer a manually-authored container
  let el = findManualContainer()

  // 2) Create one if none exists (append as last child of <body>)
  if (!el) {
    const created = document.createElement('div')
    created.className = `${STICKY_CLASS} nsw-sticky-container`
    created.id = STICKY_ID
    // Minimal inline safety if CSS hasn’t loaded yet
    created.style.position = 'fixed'
    created.style.insetBlockEnd = '0'
    created.style.insetInlineStart = '0'
    created.style.insetInlineEnd = '0'
    created.style.inlineSize = '100%'
    created.style.display = 'block'
    document.body.appendChild(created)
    el = created
  } else {
    // Normalise hooks so other modules can safely target the element
    if (!el.classList.contains(STICKY_CLASS)) el.classList.add(STICKY_CLASS)
    if (!el.id) el.id = STICKY_ID
  }

  attachObservers(el)

  // Measure after layout so padding accounts for children
  if (HAS_WINDOW && window.requestAnimationFrame) {
    requestAnimationFrame(() => requestAnimationFrame(updateStickyBodyPadding))
  } else {
    setTimeout(updateStickyBodyPadding, 0)
  }

  return el
}
