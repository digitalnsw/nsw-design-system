/* eslint-disable new-cap */
/* eslint-disable no-undef */
class DownloadPDF {
  constructor(element) {
    this.element = element
    this.contentClass = this.element.getAttribute('data-pdf-content')
    this.content = this.contentClass ? document.querySelector(`.${this.contentClass}`) : document.body
    this.name = this.element.getAttribute('data-pdf-title') || document.title
    this.buttonText = this.element.querySelector('span:not(.nsw-material-icons)')
  }

  init() {
    this.element.addEventListener('click', () => {
      this.downloadEvent()
    })

    this.element.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'enter') || (event.key && event.key.toLowerCase() === 'enter')) {
        this.downloadEvent()
      }
    })
  }

  downloadEvent() {
    const originalButtonText = this.buttonText.innerText
    this.buttonText.innerText = 'Building PDF...'

    html2canvas(this.content).then((canvas) => {
      const base64image = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height])
      pdf.addImage(base64image, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${this.name}.pdf`)

      this.buttonText.innerText = originalButtonText
    })
      .catch((error) => {
        console.error('An error occurred:', error)
        this.buttonText.innerText = originalButtonText
      })
  }
}

export default DownloadPDF
