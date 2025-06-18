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
    if (typeof html2canvas === 'undefined' || !(window.jspdf && window.jspdf.jsPDF)) {
      const scriptsToLoad = [
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          global: 'html2canvas'
        },
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
          global: 'window.jspdf.jsPDF'
        }
      ]

      let loadedCount = 0

      scriptsToLoad.forEach(({ src, global }) => {
        if (typeof window[global] === 'undefined') {
          const script = document.createElement('script')
          script.src = src
          script.async = false
          script.onload = () => {
            loadedCount++
            if (loadedCount === scriptsToLoad.length) {
              this.downloadEvent()
            }
          }
          document.head.appendChild(script)
        } else {
          loadedCount++
        }
      })

      return
    }

    if (this.isGenerating) return
    this.isGenerating = true

    const originalButtonText = this.buttonText.innerText
    this.buttonText.innerText = 'Building PDF...'

    html2canvas(this.content).then((canvas) => {
      const base64image = canvas.toDataURL('image/png')
      const pdf = new window.jspdf.jsPDF('p', 'px', [canvas.width, canvas.height])
      pdf.addImage(base64image, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${this.name}.pdf`)

      this.buttonText.innerText = originalButtonText
      this.isGenerating = false
    })
      .catch((error) => {
        console.error('An error occurred:', error)
        this.buttonText.innerText = originalButtonText
        this.isGenerating = false
      })
  }
}

export default DownloadPDF
