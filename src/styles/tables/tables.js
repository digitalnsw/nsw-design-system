function ResponsiveTables(element) {
  // this.triggerButton = element
  // this.originalButton = document.querySelector('.js-open-search')
  // this.targetElement = document.getElementById(this.triggerButton.getAttribute('aria-controls'))
  // this.searchInput = this.targetElement.querySelector('.js-search-input')
  // this.pressed = this.triggerButton.getAttribute('aria-expanded') === 'true'
  this.table = element
  this.tablehead = element.getElementsByTagName('thead')
  this.thCells = this.tablehead[0].getElementsByTagName('th')
  this.tablebody = element.getElementsByTagName('tbody')
  this.tdCells = Array.prototype.slice.call(this.tablebody[0].getElementsByTagName('td'))


  this.tdCells.forEach((cell) => {
    const theCell = cell
    const headingText = this.thCells[cell.cellIndex].textContent
    // const cellStuff = cell.innerHTML
    const heading = document.createElement('strong')
    heading.classList.add('nsw-table__heading')
    heading.innerHTML = headingText
    theCell.appendChild(heading)
    theCell.insertAdjacentElement('afterbegin', heading)
    theCell.setAttribute('data-th', this.thCells[cell.cellIndex].innerHTML)
  })

  // $('td').each (function() {
  //   var th = $(this).closest('table').find('th').eq( this.cellIndex );
  //   var thContent = $(th).html();
  //   $(this).attr('data-th',thContent);
  // });
}

// ResponsiveTables.prototype.init = function init() {
//   this.controls()
// }

// ResponsiveTables.prototype.controls = function controls() {
//   this.triggerButton.addEventListener('click', this.showHide.bind(this), false)
// }

// ResponsiveTables.prototype.showHide = function showHide() {
//   if (this.pressed) {
//     this.targetElement.hidden = true
//     this.originalButton.hidden = false
//     this.originalButton.focus()
//   } else {
//     this.targetElement.hidden = false
//     this.originalButton.hidden = true
//     this.searchInput.focus()
//   }
// }

export default ResponsiveTables
