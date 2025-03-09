import Toggletip from '../tooltip/toggletip'

class UtilityList extends Toggletip {
  constructor(element, toggletip = element.querySelector('.js-share')) {
    super(toggletip === null ? element : toggletip)
    this.element = element
    this.share = toggletip
    this.print = this.element.querySelectorAll('.js-print-page')
    this.download = this.element.querySelectorAll('.js-download-page')
    this.copy = this.element.querySelectorAll('.js-copy-clipboard')
    this.shareItems = this.share && this.share.querySelectorAll('a')
    this.urlLocation = window.location.href
    this.copyElement = false
  }

  init() {
    if (this.share) {
      super.init()
      this.shareItems.forEach((share) => {
        const shareLocation = share.getAttribute('data-url')
        if (!shareLocation) {
          share.setAttribute('data-url', window.location.href)
        }
      })

      this.share.addEventListener('click', (event) => {
        const button = event.target.closest('a')
        if (!button) return

        event.preventDefault()

        const social = button.getAttribute('data-social')
        const url = this.getSocialUrl(button, social)
        if (social === 'mail') {
          window.location.href = url
        } else {
          window.open(url, `${social}-share-dialog`, 'width=626,height=436')
        }
      })
    }

    if (this.print) {
      this.print.forEach((element) => {
        element.setAttribute('tabindex', '0')

        element.addEventListener('click', () => {
          window.print()
        })

        element.addEventListener('keyup', (event) => {
          if ((event.code && event.code.toLowerCase() === 'enter') || (event.key && event.key.toLowerCase() === 'enter')) {
            window.print()
          }
        })
      })
    }

    if (this.download) {
      this.download.forEach((element) => {
        element.setAttribute('tabindex', '0')
      })
    }

    if (this.copy) {
      this.copy.forEach((element) => {
        element.setAttribute('tabindex', '0')
        element.addEventListener('click', () => {
          this.copyToClipboard(element)
        })

        element.addEventListener('keyup', (event) => {
          if ((event.code && event.code.toLowerCase() === 'enter') || (event.key && event.key.toLowerCase() === 'enter')) {
            this.copyToClipboard(element)
          }
        })
      })
    }
  }

  getSocialUrl(button, social) {
    const params = this.getSocialParams(social)
    let newUrl = ''

    if (social === 'twitter') {
      this.getTwitterText(button)
    }

    params.forEach((param) => {
      let paramValue = button.getAttribute(`data-${param}`)
      if (param === 'hashtags') paramValue = encodeURI(paramValue.replace(/#| /g, ''))
      if (paramValue) {
        if (social === 'facebook') {
          newUrl = `${newUrl}u=${encodeURIComponent(paramValue)}&`
        } else {
          newUrl = `${newUrl + param}=${encodeURIComponent(paramValue)}&`
        }
      }
    })
    if (social === 'linkedin') newUrl = `mini=true&${newUrl}`
    return `${button.getAttribute('href')}?${newUrl}`
  }

  getSocialParams(social) {
    switch (social) {
      case 'twitter':
        this.socialParams = ['text', 'hashtags']
        break
      case 'facebook':
      case 'linkedin':
        this.socialParams = ['url']
        break
      case 'mail':
        this.socialParams = ['subject', 'body']
        break
      default:
        console.log('No social links found')
        break
    }
    return this.socialParams
  }

  getTwitterText(button) {
    let twitText = button.getAttribute('data-text')
    const twitUrl = button.getAttribute('data-url') || this.urlLocation
    const twitUsername = button.getAttribute('data-username')
    if (twitUsername) {
      twitText = `${twitText} ${twitUrl} via ${twitUsername}`
    } else {
      twitText = `${twitText} ${twitUrl}`
    }
    button.setAttribute('data-text', twitText)
    button.removeAttribute('data-url')
    button.removeAttribute('data-username')
  }

  copyToClipboard(element) {
    if (!navigator.clipboard) {
      const input = document.createElement('input')
      input.setAttribute('value', this.urlLocation)
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.copiedMessage(element)
    } else {
      navigator.clipboard.writeText(this.urlLocation).then(() => {
        this.copiedMessage(element)
      })
    }
  }

  copiedMessage(element) {
    this.copyElement = element
    const icon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">link</span>'
    const originalText = this.copyElement.innerHTML

    this.copyElement.classList.add('copied')
    this.copyElement.innerHTML = `${icon} Copied`

    setTimeout(() => {
      this.copyElement.classList.remove('copied')
      this.copyElement.innerHTML = originalText
    }, 3000)
  }
}

export default UtilityList
