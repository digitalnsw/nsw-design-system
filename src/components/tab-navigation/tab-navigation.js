import { uniqueId } from '../../global/scripts/helpers/utilities'

function Tabs(element) {
  this.tab = element
  this.tabList = element.querySelector('ul')
  this.tabItems = this.tabList.querySelectorAll('li')
  this.tabContents = []
  this.selectedTab = null
  this.showHideEvent = (e) => this.showHide(e)
}

Tabs.prototype.init = function init() {
  this.setUpDom()
  // this.controls()
}

Tabs.prototype.setUpDom = function setUpDom() {
  this.tab.classList.add('is-ready')
  this.tabList.setAttribute('role', 'tablist')
  this.tabItems.forEach((item, index) => {
    const itemElem = item
    const itemLink = item.querySelector('a')
    const content = this.tab.querySelector(itemLink.hash)
    const uID = uniqueId('accordion')
    item.classList.toggle('is-selected', index === 0)
    itemElem.setAttribute('role', 'presentation')
    itemLink.setAttribute('role', 'tab')
    itemLink.setAttribute('id', uID)
    itemLink.setAttribute('tabindex', '-1')
    itemLink.setAttribute('aria-selected', index === 0)
    if (index === 0) this.selectedTab = itemLink
    content.setAttribute('role', 'tabpanel')
    content.setAttribute('role', 'tabpanel')
    content.setAttribute('aria-labelledBy', uID)
    content.setAttribute('tabindex', '-1')
    content.hidden = index !== 0
  })
}

Tabs.prototype.changeTabs = function changeTabs(e) {
  const clickedTab = e.currentTarget
  clickedTab.focus()
  clickedTab.removeAttrubute('tabindex')
  clickedTab.setAttribute('aria-selected', true)
  this.selectedTab.removeAttrubute('aria-selected')
  this.selectedTab.setAttribute('tabindex', '-1')
}


export default Tabs
