// Progressive enhancement for CSS-only accordions
// - Syncs ARIA (aria-expanded / aria-hidden)
// - Wires optional Expand all / Collapse all toolbar if present
// - Optional single-open via data-single-open (no layout reads/writes => no CLS)

class CssAccordion {
  constructor(container) {
    this.container = container
    this.items = []
  }

  static syncItem(item) {
    const input = item.querySelector('.nsw-accordion__control')
    const label = item.querySelector('.nsw-accordion__title')
    const panel = item.querySelector('.nsw-accordion__content-wrap')
    if (!input || !label || !panel) return

    // Ensure IDs/relationships
    if (!panel.id) panel.id = `${input.id || 'accordion'}-panel`
    label.setAttribute('role', 'button')
    label.setAttribute('aria-controls', panel.id)

    const expanded = !!input.checked
    label.setAttribute('aria-expanded', expanded ? 'true' : 'false')
    panel.setAttribute('role', 'region')
    panel.setAttribute('aria-hidden', expanded ? 'false' : 'true')
  }

  init() {
    const { container } = this
    if (!container || !container.classList || !container.classList.contains('nsw-accordion--css')) return

    this.items = Array.from(container.querySelectorAll('.nsw-accordion__item'))
    if (!this.items.length) return

    // Initial ARIA sync
    this.items.forEach((item) => CssAccordion.syncItem(item))

    // Change handling (includes optional single-open behaviour)
    container.addEventListener('change', (e) => {
      if (!e.target.matches('.nsw-accordion__control')) return

      const changed = e.target
      const item = changed.closest('.nsw-accordion__item')

      // Optional single-open: if container has data-single-open, uncheck others when one is checked
      if (container.hasAttribute('data-single-open') && changed.checked) {
        this.items.forEach((it) => {
          const ctrl = it.querySelector('.nsw-accordion__control')
          if (ctrl && ctrl !== changed) ctrl.checked = false
          CssAccordion.syncItem(it)
        })
      } else {
        CssAccordion.syncItem(item)
      }
    })

    // Keyboard support on label (Enter/Space toggles the paired control)
    container.addEventListener('keydown', (e) => {
      const label = e.target.closest('.nsw-accordion__title[role="button"]')
      if (!label || !container.contains(label)) return
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      const input = label.previousElementSibling
      if (input && input.classList && input.classList.contains('nsw-accordion__control')) {
        input.checked = !input.checked
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    // Optional: wire Expand all / Collapse all toolbar if present in markup
    const toolbar = container.querySelector('.nsw-accordion__toggle')
    if (toolbar) {
      const [expandBtn, collapseBtn] = Array.from(toolbar.querySelectorAll('button'))
      const controls = this.items.map((it) => it.querySelector('.nsw-accordion__control')).filter(Boolean)

      const updateButtons = () => {
        const allOpen = controls.length && controls.every((ctrl) => ctrl.checked === true)
        const allClosed = controls.length && controls.every((ctrl) => ctrl.checked === false)
        if (expandBtn) expandBtn.disabled = !!allOpen
        if (collapseBtn) collapseBtn.disabled = !!allClosed
      }

      if (expandBtn) {
        expandBtn.addEventListener('click', () => {
          for (let i = 0; i < controls.length; i += 1) {
            const ctrl = controls[i]
            ctrl.checked = true
            ctrl.dispatchEvent(new Event('change', { bubbles: true }))
          }
          updateButtons()
        })
      }
      if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
          for (let i = 0; i < controls.length; i += 1) {
            const ctrl = controls[i]
            ctrl.checked = false
            ctrl.dispatchEvent(new Event('change', { bubbles: true }))
          }
          updateButtons()
        })
      }

      // Keep toolbar state in sync
      container.addEventListener('change', (e) => {
        if (!e.target.matches('.nsw-accordion__control')) return
        updateButtons()
      })

      updateButtons()
    }

    // Optional: open by hash (deep-linking)
    if (window.location && window.location.hash) {
      const byId = container.querySelector(window.location.hash)
      const item = byId && byId.closest('.nsw-accordion__item')
      const control = item && item.querySelector('.nsw-accordion__control')
      if (control && !control.checked) {
        control.checked = true
        control.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }
}

export default CssAccordion
