// Progressive enhancement for <details> accordions
// - Syncs ARIA labelling for panels
// - Wires optional Expand all / Collapse all toolbar if present
// - Keeps toolbar buttons in sync with open state and honours deep links

import {
  isAriaDisabled,
  setAriaDisabled,
  uniqueId,
} from '../../global/scripts/helpers/utilities'

const generateId = (details) => {
  const { id } = details
  if (id) return id
  const generatedId = uniqueId('accordion-details')
  details.setAttribute('id', generatedId)
  return generatedId
}
class CssAccordion {
  constructor(container) {
    this.container = container
    this.items = []
  }

  init() {
    const { container } = this
    if (!container || !container.classList) return

    if (container.matches && container.matches('details.nsw-accordion__item')) {
      this.items = [container]
    } else {
      this.items = Array.from(container.querySelectorAll('details.nsw-accordion__item'))
    }
    if (!this.items.length) return

    // Initial ARIA sync
    this.items.forEach((details) => {
      const summary = details.querySelector('.nsw-accordion__title')
      const panel = details.querySelector('.nsw-accordion__content-wrap')
        || details.querySelector('.nsw-accordion__content')
      if (!summary || !panel) return
      const baseId = details.id || generateId(details)

      if (!panel.id) panel.id = `${baseId}-panel`
      if (!summary.id) summary.id = `${baseId}-summary`
      panel.setAttribute('role', 'region')
      panel.setAttribute('aria-labelledby', summary.id)
    })

    const toolbar = container.querySelector ? container.querySelector('.nsw-accordion__toggle') : null
    let updateButtons

    if (toolbar) {
      const expandBtn = toolbar.querySelector('button[aria-label^="Expand all"]')
      const collapseBtn = toolbar.querySelector('button[aria-label^="Collapse all"]')

      const update = () => {
        const { items } = this
        const allOpen = items.length && items.every((d) => d.open === true)
        const allClosed = items.length && items.every((d) => d.open === false)
        const { activeElement } = document
        const shouldMoveToCollapse = allOpen && activeElement === expandBtn
        const shouldMoveToExpand = allClosed && activeElement === collapseBtn

        if (shouldMoveToCollapse && collapseBtn) collapseBtn.focus()
        if (shouldMoveToExpand && expandBtn) expandBtn.focus()

        if (expandBtn) setAriaDisabled(expandBtn, !!allOpen)
        if (collapseBtn) setAriaDisabled(collapseBtn, !!allClosed)
      }

      if (expandBtn) {
        expandBtn.addEventListener('click', () => {
          if (isAriaDisabled(expandBtn)) return
          for (let i = 0; i < this.items.length; i += 1) {
            const details = this.items[i]
            if (!details.open) details.open = true
          }
          update()
        })
      }

      if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
          if (isAriaDisabled(collapseBtn)) return
          for (let i = 0; i < this.items.length; i += 1) {
            const details = this.items[i]
            if (details.open) details.open = false
          }
          update()
        })
      }

      updateButtons = update
      updateButtons()
    }

    // Keep ARIA + toolbar in sync when a single <details> is toggled
    this.items.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (updateButtons) updateButtons()
      })
    })

    // Optional: open by hash (deep-linking)
    const { location } = window
    if (location && location.hash) {
      let hashId = location.hash.slice(1)

      try {
        hashId = decodeURIComponent(hashId)
      } catch (error) {
        hashId = location.hash.slice(1)
      }

      const byId = hashId ? document.getElementById(hashId) : null
      const scoped = byId && (byId === container || (container.contains && container.contains(byId)))
      const details = scoped && (byId.matches && byId.matches('details.nsw-accordion__item')
        ? byId
        : byId.closest('details.nsw-accordion__item'))
      if (details) {
        if (!details.open) {
          details.open = true
          if (updateButtons) updateButtons()
        }

        // Move focus to the target or the summary to aid keyboard/screen reader users
        const focusTarget = byId || details.querySelector('.nsw-accordion__title')
        if (focusTarget) {
          if (focusTarget.tabIndex < 0) focusTarget.tabIndex = -1
          focusTarget.focus({ preventScroll: true })
        }
      }
    }
  }
}
export default CssAccordion
