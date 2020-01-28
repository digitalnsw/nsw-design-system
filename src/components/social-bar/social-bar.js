import { popupWindow } from '../../global/scripts/helpers/utilities'

class ShareThis {
  constructor() {
    this.sharelinks = document.querySelectorAll('.js-share-this')
  }

  init() {
    this.controls()
  }

  controls() {
    this.sharelinks.forEach((element) => {
      element.addEventListener('click', this.popup, false)
    })
  }

  popup(e) {
    e.preventDefault()
    popupWindow(this.href, 600, 600)
  }
}

export default ShareThis
