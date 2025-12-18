// Progressive enhancement for <details> accordions
// - Syncs ARIA labelling for panels
// - Wires optional Expand all / Collapse all toolbar if present
// - Keeps toolbar buttons in sync with open state and honours deep links

class CssAccordion {
  constructor(container) {
    this.container = container
    this.items = []
  }

  init() {
    const { container } = this
    if (!container || !container.classList) return

    this.items = Array.from(container.querySelectorAll('details.nsw-accordion__item'))
    if (!this.items.length) return

    // Initial ARIA sync
    this.items.forEach((details) => {
      const summary = details.querySelector('.nsw-accordion__title')
      const panel = details.querySelector('.nsw-accordion__content-wrap')
      if (!summary || !panel) return
      const baseId = details.id || 'accordion-details'

      if (!panel.id) panel.id = `${baseId}-panel`
      if (!summary.id) summary.id = `${baseId}-summary`
      panel.setAttribute('role', 'region')
      panel.setAttribute('aria-labelledby', summary.id)
    })

    const toolbar = container.querySelector('.nsw-accordion__toggle')
    let updateButtons

    if (toolbar) {
      const [expandBtn, collapseBtn] = Array.from(toolbar.querySelectorAll('button'))

      const update = () => {
        const allOpen = this.items.length && this.items.every((d) => d.open === true)
        const allClosed = this.items.length && this.items.every((d) => d.open === false)
        if (expandBtn) expandBtn.disabled = !!allOpen
        if (collapseBtn) collapseBtn.disabled = !!allClosed
      }

      if (expandBtn) {
        expandBtn.addEventListener('click', () => {
          for (let i = 0; i < this.items.length; i += 1) {
            const details = this.items[i]
            if (!details.open) details.open = true
          }
          update()
        })
      }

      if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
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
    if (window.location && window.location.hash) {
      const byId = container.querySelector(window.location.hash)
      const details = byId && byId.closest('details.nsw-accordion__item')
      if (details && !details.open) {
        details.open = true
        if (updateButtons) updateButtons()

        // Move focus to the target or the summary to aid keyboard/screen reader users
        if (byId) {
          if (byId.tabIndex < 0) byId.tabIndex = -1
          byId.focus({ preventScroll: true })
        } else {
          const summary = details.querySelector('.nsw-accordion__title')
          if (summary) {
            if (summary.tabIndex < 0) summary.tabIndex = -1
            summary.focus({ preventScroll: true })
          }
        }
      }
    }
  }
}

export default CssAccordion
