function ResponsiveTables(element) {
  this.table = element
  this.tablehead = element.getElementsByTagName('thead')
  this.thCells = this.tablehead[0].getElementsByTagName('th')
  this.tablebody = element.getElementsByTagName('tbody')
  this.tdCells = Array.prototype.slice.call(this.tablebody[0].getElementsByTagName('td'))
}

ResponsiveTables.prototype.init = function init() {
  this.table.classList.add('nsw-table--stacked')
  this.addHeadingContent()
  this.enhanceWithAria()
}

ResponsiveTables.prototype.addHeadingContent = function addHeadingContent() {
  this.tdCells.forEach((cell) => {
    const theCell = cell
    const headingText = this.thCells[cell.cellIndex].textContent
    const heading = document.createElement('strong')
    heading.classList.add('nsw-table__heading')
    heading.innerHTML = `${headingText}: `
    theCell.insertAdjacentElement('afterbegin', heading)
  })
}

ResponsiveTables.prototype.enhanceWithAria = function enhanceWithAria() {
  this.tdCells.forEach((cell) => {
    const rowElement = cell.parentNode
    rowElement.setAttribute('role', 'row')
    cell.setAttribute('role', 'cell')
  })
}

export default ResponsiveTables
