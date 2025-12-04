// Progressive enhancement for <details> accordions
// - Syncs ARIA (aria-expanded / aria-hidden)
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

    const isDetails = container.classList.contains('js-accordion-details')
    if (!isDetails) return

    // ------------------------------------
    // <details> variant
    // ------------------------------------
    if (isDetails) {
      this.items = Array.from(container.querySelectorAll('details.nsw-accordion__item'))
      if (!this.items.length) return

      // Initial ARIA sync
      this.items.forEach((details) => {
        const summary = details.querySelector('.nsw-accordion__title')
        const panel = details.querySelector('.nsw-accordion__content-wrap')
        if (!summary || !panel) return

        if (!panel.id) panel.id = `${details.id || 'accordion-details'}-panel`
        summary.setAttribute('role', 'button')
        summary.setAttribute('aria-controls', panel.id)
        summary.setAttribute('aria-expanded', details.open ? 'true' : 'false')
        panel.setAttribute('role', 'region')
        panel.setAttribute('aria-hidden', details.open ? 'false' : 'true')
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
              const summary = details.querySelector('.nsw-accordion__title')
              if (summary) summary.setAttribute('aria-expanded', 'true')
              const panel = details.querySelector('.nsw-accordion__content-wrap')
              if (panel) panel.setAttribute('aria-hidden', 'false')
            }
            update()
          })
        }

        if (collapseBtn) {
          collapseBtn.addEventListener('click', () => {
            for (let i = 0; i < this.items.length; i += 1) {
              const details = this.items[i]
              if (details.open) details.open = false
              const summary = details.querySelector('.nsw-accordion__title')
              if (summary) summary.setAttribute('aria-expanded', 'false')
              const panel = details.querySelector('.nsw-accordion__content-wrap')
              if (panel) panel.setAttribute('aria-hidden', 'true')
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
          const summary = details.querySelector('.nsw-accordion__title')
          const panel = details.querySelector('.nsw-accordion__content-wrap')
          if (summary) summary.setAttribute('aria-expanded', details.open ? 'true' : 'false')
          if (panel) panel.setAttribute('aria-hidden', details.open ? 'false' : 'true')
          if (updateButtons) updateButtons()
        })
      })

      // Optional: open by hash (deep-linking)
      if (window.location && window.location.hash) {
        const byId = container.querySelector(window.location.hash)
        const details = byId && byId.closest('details.nsw-accordion__item')
        if (details && !details.open) {
          details.open = true
          const summary = details.querySelector('.nsw-accordion__title')
          const panel = details.querySelector('.nsw-accordion__content-wrap')
          if (summary) summary.setAttribute('aria-expanded', 'true')
          if (panel) panel.setAttribute('aria-hidden', 'false')
          if (updateButtons) updateButtons()
        }
      }

      return
    }
  }
}

export default CssAccordion
