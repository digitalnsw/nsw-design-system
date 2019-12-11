import { popupWindow } from '../../global/scripts/helpers/utilities'

function ShareThis() {
  this.sharelinks = document.querySelectorAll('.js-share-this')
}

ShareThis.prototype.init = function init() {
  this.controls()
}

ShareThis.prototype.controls = function controls() {
  this.sharelinks.forEach((element) => {
    element.addEventListener('click', this.popup, false)
  })
}

ShareThis.prototype.popup = function popup(e) {
  e.preventDefault()
  popupWindow(this.href, 600, 600)
}

export default ShareThis
