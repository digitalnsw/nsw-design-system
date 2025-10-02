export function updateStickyBodyPadding() {
  const measure = () => {
    const el = document.querySelector('.js-sticky-container')
    if (!el) return
    const h = el.getBoundingClientRect().height || 0
    document.body.style.paddingBottom = `${h}px`
  }
  try {
    if (window.requestAnimationFrame) {
      // Measure after layout/paint to avoid cutting height when elements are added/replaced
      requestAnimationFrame(() => requestAnimationFrame(measure))
    } else {
      setTimeout(measure, 0)
    }
  } catch (_) {
    // Fallback if rAF not available in environment
    measure()
  }
}

export default function stickyContainer() {
  let containerEl = document.querySelector('.js-sticky-container')
  if (!containerEl) {
    containerEl = document.createElement('div')
    containerEl.className = 'js-sticky-container'
    containerEl.id = 'sticky-container'
    containerEl.style.position = 'fixed'
    containerEl.style.bottom = '0'
    containerEl.style.left = '0'
    containerEl.style.width = '100%'
    containerEl.style.display = 'block'
    containerEl.style.zIndex = '9900'
    document.body.appendChild(containerEl)
  }

  // Attach observers once to keep body padding in sync with size/child changes
  if (!containerEl.dataset.stickyObserved) {
    try {
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => updateStickyBodyPadding())
        ro.observe(containerEl)
      } else {
        window.addEventListener('resize', updateStickyBodyPadding)
      }
      // Also watch for child list mutations (add/remove) which can precede size paint
      if (window.MutationObserver) {
        const mo = new MutationObserver(() => updateStickyBodyPadding())
        mo.observe(containerEl, { childList: true, subtree: false })
      }
    } catch (e) {
      // no-op
    }
    containerEl.dataset.stickyObserved = '1'
  }

  return containerEl
}
