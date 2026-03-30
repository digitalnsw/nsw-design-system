import { uniqueId } from '../../global/scripts/helpers/utilities'

class Tabs {
  constructor(element, showTab) {
    this.element = element
    this.tablistClass = '.nsw-tabs__list'
    this.tablistItemClass = 'li'
    this.tablistLinkClass = 'a'
    this.showTab = showTab
    this.tabList = this.element.querySelector(this.tablistClass)
    this.tabItems = this.tabList && this.tabList.querySelectorAll(this.tablistItemClass)
    this.allowedKeys = [35, 36, 37, 39, 40]
    this.tabLinks = []
    this.tabPanel = []
    this.selectedTab = null
    this.tabListWrapper = null
    this.enableHashNavigation = false
    this.focusableSelector = `a[href],button:not([disabled]),
      area[href],input:not([disabled]):not([type=hidden]),
      select:not([disabled]),textarea:not([disabled]),
      iframe,object,embed,*[tabindex]:not([tabindex="-1"]),
      *[contenteditable]`
    this.clickTabEvent = (event) => this.clickTab(event)
    this.arrowKeysEvent = (event) => this.arrowKeys(event)
    this.hashChangeEvent = () => this.handleHashChange()
    this.updateScrollableStateEvent = () => this.updateScrollableState()
    this.owns = []
  }

  init() {
    if (!this.tabList) return
    this.setUpDom()
    this.controls()
    this.setInitialTab()
    this.updateScrollableState()
  }

  setUpDom() {
    const existingWrapper = this.element.querySelector('.nsw-tabs__list-wrapper')
    const tabListWrapper = existingWrapper || document.createElement('div')
    this.tabListWrapper = tabListWrapper

    if (!existingWrapper) {
      tabListWrapper.classList.add('nsw-tabs__list-wrapper')
      this.element.prepend(tabListWrapper)
      tabListWrapper.prepend(this.tabList)
    }

    this.tabList.setAttribute('role', 'tablist')

    this.tabItems.forEach((item) => {
      const itemElem = item
      const itemLink = item.querySelector(this.tablistLinkClass)
      if (!itemLink || !itemLink.hash) return
      const panel = this.element.querySelector(itemLink.hash)
      if (!panel) return
      const uID = uniqueId('tab')
      this.owns.push(uID)
      itemElem.setAttribute('role', 'presentation')
      this.enhanceTabLink(itemLink, panel, uID)
      this.enhanceTabPanel(panel, uID)
    })

    this.tabList.setAttribute('aria-owns', this.owns.join(' '))
    this.setTabMetadata()
    this.enableHashNavigation = this.tabLinks.some((link) => this.shouldSyncHash(link))
  }

  enhanceTabLink(link, panel, id) {
    link.setAttribute('role', 'tab')
    link.setAttribute('id', id)
    link.setAttribute('aria-controls', panel.id)
    link.setAttribute('aria-selected', false)
    link.setAttribute('tabindex', '-1')
    this.tabLinks.push(link)
  }

  setTabMetadata() {
    const tabCount = this.tabLinks.length

    this.tabLinks.forEach((link, index) => {
      if (tabCount > 3) {
        link.setAttribute('aria-posinset', `${index + 1}`)
        link.setAttribute('aria-setsize', `${tabCount}`)
      } else {
        link.removeAttribute('aria-posinset')
        link.removeAttribute('aria-setsize')
      }
    })
  }

  enhanceTabPanel(panel, id) {
    const panelElem = panel
    panelElem.setAttribute('role', 'tabpanel')
    panelElem.setAttribute('aria-labelledby', id)
    if (!this.hasFocusableContent(panelElem)) {
      panelElem.setAttribute('tabindex', '0')
    } else {
      panelElem.removeAttribute('tabindex')
    }
    panelElem.hidden = true
    this.tabPanel.push(panelElem)
  }

  hasFocusableContent(panel) {
    return !!panel.querySelector(this.focusableSelector)
  }

  setInitialTab() {
    const selectedIndex = this.getInitialTabIndex()
    const selectedLink = this.tabLinks[selectedIndex]

    if (!selectedLink) return

    this.switchTabs(selectedLink, {
      focus: false,
      updateHash: false,
      smoothScroll: false,
    })
  }

  getInitialTabIndex() {
    const lastIndex = this.tabLinks.length - 1
    let index = (this.showTab === undefined) ? 0 : Number(this.showTab)

    if (Number.isNaN(index) || index < 0) {
      index = 0
    }

    if (this.enableHashNavigation) {
      const hashTabIndex = this.getTabIndexByHash(window.location.hash)
      if (hashTabIndex > -1) index = hashTabIndex
    }

    return (index > lastIndex) ? 0 : index
  }

  static normaliseHash(hash = '') {
    if (!hash) return ''
    const trimmedHash = hash.charAt(0) === '#' ? hash.slice(1) : hash

    try {
      return decodeURIComponent(trimmedHash)
    } catch (error) {
      return trimmedHash
    }
  }

  static getTabHash(link) {
    const controlsId = link.getAttribute('aria-controls')
    if (controlsId) return `#${controlsId}`
    return link.hash || ''
  }

  getTabIndexByHash(rawHash) {
    const hash = Tabs.normaliseHash(rawHash)
    if (!hash) return -1

    return this.tabLinks.findIndex((link) => Tabs.normaliseHash(Tabs.getTabHash(link)) === hash)
  }

  shouldSyncHash(link) {
    return !this.element.classList.contains('js-tabs-fixed') && !link.classList.contains('js-tabs-fixed')
  }

  syncHash(link) {
    if (!this.shouldSyncHash(link)) return

    const hash = Tabs.getTabHash(link)
    if (!hash || window.location.hash === hash) return

    window.location.hash = hash
  }

  handleHashChange() {
    const hashTabIndex = this.getTabIndexByHash(window.location.hash)
    if (hashTabIndex < 0) return

    const targetTab = this.tabLinks[hashTabIndex]
    if (!targetTab || targetTab === this.selectedTab) return

    this.switchTabs(targetTab, {
      focus: false,
      updateHash: false,
      smoothScroll: false,
    })
  }

  updateScrollableState() {
    const { tabList, tabListWrapper } = this
    if (!tabList || !tabListWrapper) return

    const maxScroll = Math.max(tabList.scrollWidth - tabList.clientWidth, 0)
    const hasOverflow = maxScroll > 1
    const hasOverflowAtStart = hasOverflow && tabList.scrollLeft > 1
    const hasOverflowAtEnd = hasOverflow && tabList.scrollLeft < (maxScroll - 1)

    tabListWrapper.setAttribute('data-overflow-start', hasOverflowAtStart ? 'true' : 'false')
    tabListWrapper.setAttribute('data-overflow-end', hasOverflowAtEnd ? 'true' : 'false')
  }

  clickTab(e) {
    e.preventDefault()
    this.switchTabs(e.currentTarget)
  }

  switchTabs(elem, options = {}) {
    const {
      focus = true,
      updateHash = true,
      smoothScroll = true,
    } = options
    const clickedTab = elem

    if (!clickedTab) return

    const clickedTabIndex = this.tabLinks.indexOf(clickedTab)
    if (clickedTabIndex < 0) return

    if (clickedTab !== this.selectedTab) {
      if (focus) clickedTab.focus()
      clickedTab.removeAttribute('tabindex')
      clickedTab.setAttribute('aria-selected', true)
      clickedTab.classList.add('active')

      if (this.selectedTab) {
        const selectedTabIndex = this.tabLinks.indexOf(this.selectedTab)
        this.selectedTab.setAttribute('aria-selected', false)
        this.selectedTab.setAttribute('tabindex', '-1')
        this.selectedTab.classList.remove('active')

        if (selectedTabIndex > -1) {
          this.tabPanel[selectedTabIndex].hidden = true
        }
      }

      this.tabPanel[clickedTabIndex].hidden = false
      this.selectedTab = clickedTab

      if (!clickedTab.classList.contains('js-tabs-fixed') && smoothScroll) {
        clickedTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        })
      }
    }

    if (updateHash) this.syncHash(clickedTab)
  }

  focusTabPanel(index) {
    const panel = this.tabPanel[index]
    if (!panel) return

    const focusableChild = panel.querySelector(this.focusableSelector)
    if (focusableChild) {
      focusableChild.focus()
      return
    }

    panel.focus()
  }

  arrowKeys(event) {
    const keycode = event.which || event.keyCode
    const linkLength = this.tabLinks.length - 1
    let index = this.tabLinks.indexOf(this.selectedTab)
    let down = false

    if (this.allowedKeys.includes(keycode)) {
      event.preventDefault()

      switch (keycode) {
        case 35:
          index = linkLength
          break
        case 36:
          index = 0
          break
        case 37:
          index = (index === 0) ? -1 : index -= 1
          break
        case 39:
          index = (index === linkLength) ? -1 : index += 1
          break
        case 40:
          down = true
          break
        default:
          break
      }

      if (index > -1) {
        if (down) {
          this.focusTabPanel(index)
        } else {
          this.switchTabs(this.tabLinks[index])
        }
      }
    }
  }

  controls() {
    this.tabLinks.forEach((link) => {
      link.addEventListener('click', this.clickTabEvent, false)
      link.addEventListener('keydown', this.arrowKeysEvent, false)
    })

    this.tabList.addEventListener('scroll', this.updateScrollableStateEvent, { passive: true })
    window.addEventListener('resize', this.updateScrollableStateEvent, false)

    if (this.enableHashNavigation) {
      window.addEventListener('hashchange', this.hashChangeEvent, false)
    }
  }
}

export default Tabs
