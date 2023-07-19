class ProgressIndicatorPage {
  constructor(element) {
    this.element = element
    this.page = window
    this.progressBar = this.element.querySelector('.nsw-progress-indicator-page__bar')
    this.progressCircle = this.element.querySelector('.nsw-progress-indicator-page__circle')
  }

  init() {
    if (!this.element) return

    this.page.addEventListener('scroll', () => {
      const progressPercentage = (this.page.scrollY / (this.page.document.documentElement.scrollHeight - this.page.innerHeight)) * 100
      if (this.progressBar) {
        this.progressBar.style.width = `${progressPercentage}%`
      }
      if (this.progressCircle) {
        this.progressCircle.style.strokeDashoffset = 100 - progressPercentage
      }
    })
  }
}

export default ProgressIndicatorPage
