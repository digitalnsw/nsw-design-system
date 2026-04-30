import languageOptions from './language-options'

class LanguageControl {
  constructor(element) {
    this.element = element
    this.languageRoot = document.documentElement
    this.languageSelect = null
    this.placeholderOption = null
    this.currentLanguage = null
    this.originalTitle = document.title
    this.originalText = new Map()
    this.titleProxy = null
    this.languageLabelProxy = null
    this.labelRefreshTimers = []
    this.googleChromeObserver = null
    this.iconObserver = null
  }

  init() {
    this.preventIconTranslation()
    this.captureOriginalText()
    this.languageSelect = this.createLanguageSelector()
    this.ensureLanguageLabelProxy()
    this.setLanguageFromURL()
    this.addEventListeners()
    this.loadGoogleTranslate()
    this.observeGoogleChrome()
    this.observeIcons()
  }

  ensureUtilityContainer() {
    const existingUtility = this.element.querySelector('.js-color-swatches__utility')
    if (existingUtility) return existingUtility

    const utility = document.createElement('div')
    utility.classList.add('nsw-color-swatches__utility', 'js-color-swatches__utility')
    this.element.insertAdjacentElement('afterbegin', utility)
    return utility
  }

  createLanguageSelector() {
    const utility = this.ensureUtilityContainer()
    const languageSelect = document.createElement('select')
    languageSelect.classList.add('js-language-selector', 'nsw-form__select', 'nsw-color-swatches__language-selector', 'notranslate')
    languageSelect.id = `${this.element.id || 'color-swatches'}-language`
    languageSelect.setAttribute('name', 'language')
    languageSelect.setAttribute('translate', 'no')

    const languageLabel = document.createElement('label')
    languageLabel.classList.add('nsw-form__label', 'sr-only')
    languageLabel.setAttribute('for', languageSelect.id)
    languageLabel.textContent = 'Select language'

    const placeholder = document.createElement('option')
    placeholder.value = 'select'
    placeholder.textContent = '文A Language'
    placeholder.hidden = true
    placeholder.selected = true
    languageSelect.appendChild(placeholder)
    this.placeholderOption = placeholder

    languageOptions.forEach(({ code, lang }) => {
      const option = document.createElement('option')
      option.value = code
      option.textContent = this.getOptionLabel(code, lang)
      option.lang = lang
      option.dir = 'ltr'
      option.classList.add('notranslate')
      option.setAttribute('translate', 'no')
      languageSelect.appendChild(option)
    })

    utility.appendChild(languageLabel)
    utility.appendChild(languageSelect)
    return languageSelect
  }

  addEventListeners() {
    this.languageSelect.addEventListener('change', (event) => {
      const language = languageOptions.find(({ code }) => code === event.target.value)
      if (!language) return

      this.applyLanguage(language)
      const newUrl = this.updateURL(language.code)
      this.translate(language.code)
      this.languageSelect.value = 'select'
      if (language.code === 'en') window.location.replace(newUrl)
    })
  }

  applyLanguage(language) {
    this.currentLanguage = language
    this.languageRoot.lang = language.lang
    this.languageRoot.dir = language.dir || 'ltr'
    this.languageSelect.dir = this.languageRoot.dir
    this.updateLanguageLabels()

    const directionSelect = this.element.querySelector('.js-direction-selector')
    if (directionSelect) {
      directionSelect.value = this.languageRoot.dir
    }
  }

  updateLanguageLabels(currentLanguage = this.currentLanguage) {
    if (this.placeholderOption) {
      this.placeholderOption.textContent = this.getLanguageCtaLabel(currentLanguage)
    }

    Array.from(this.languageSelect.options).forEach((option) => {
      if (option.value === 'select') return

      const language = languageOptions.find(({ code }) => code === option.value)
      if (!language) return

      option.textContent = this.getOptionLabel(language.code, language.lang, currentLanguage)
      option.dir = currentLanguage ? currentLanguage.dir || 'ltr' : 'ltr'
    })
  }

  getOptionLabel(code, lang, currentLanguage = null) {
    const englishName = this.getLanguageName(code, lang, 'en')
    if (code === 'en') return 'English'

    const selectedLanguageName = currentLanguage
      ? this.getLanguageName(code, lang, currentLanguage.lang)
      : this.getNativeLanguageName(code, lang)

    return `${englishName} (${selectedLanguageName})`
  }

  getLanguageCtaLabel(currentLanguage = null) {
    if (!currentLanguage || currentLanguage.code === 'en') return '文A Language'

    const label = this.languageLabelProxy ? this.languageLabelProxy.textContent.trim() : 'Language'
    return `文A ${label}`
  }

  getNativeLanguageName(code, lang) {
    return this.getLanguageName(code, lang, lang)
  }

  getLanguageName(code, lang, locale) {
    try {
      return new Intl.DisplayNames([locale], { type: 'language' }).of(lang || code)
    } catch (error) {
      const fallbackLanguage = languageOptions.find((language) => language.code === code)
      return fallbackLanguage ? fallbackLanguage.label.split(' (')[0] : code
    }
  }

  setLanguageFromURL() {
    const params = new URLSearchParams(window.location.search)
    const languageCode = params.get('lang')
    const language = languageOptions.find(({ code }) => code === languageCode)

    if (!language) return

    this.languageSelect.value = language.code
    this.applyLanguage(language)
    this.languageSelect.value = 'select'
    this.translate(language.code)
  }

  queueLabelRefresh(language = this.currentLanguage) {
    this.labelRefreshTimers.forEach((timer) => window.clearTimeout(timer))
    this.labelRefreshTimers = [0, 250, 750, 1500, 3000].map((delay) => (
      window.setTimeout(() => this.updateLanguageLabels(language), delay)
    ))
  }

  updateURL(languageCode) {
    const params = new URLSearchParams(window.location.search)

    if (languageCode) {
      params.set('lang', languageCode)
    } else {
      params.delete('lang')
    }

    params.delete('dir')

    const search = params.toString()
    const hash = window.location.hash || ''
    const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${hash}`
    window.history.replaceState({}, '', newUrl)
    return newUrl
  }

  captureOriginalText() {
    const excluded = 'script, style, noscript, textarea, option, code, pre'
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.nodeValue.trim() || node.parentElement.closest(excluded)) {
          return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    })

    while (walker.nextNode()) {
      this.originalText.set(walker.currentNode, walker.currentNode.nodeValue)
    }
  }

  preventIconTranslation(root = document) {
    root.querySelectorAll('.material-icons, .material-icons-outlined, .material-icons-round, .material-icons-sharp, .material-icons-two-tone, .material-symbols-outlined, .nsw-material-icons')
      .forEach((icon) => {
        icon.classList.add('notranslate')
        icon.setAttribute('translate', 'no')
      })
  }

  observeIcons() {
    if (this.iconObserver) return

    this.iconObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return
          this.preventIconTranslation(node)
        })
      })
    })
    this.iconObserver.observe(document.body, { childList: true, subtree: true })
  }

  restoreOriginalText() {
    this.originalText.forEach((text, node) => {
      node.nodeValue = text
    })
    document.title = this.originalTitle
  }

  ensureLanguageLabelProxy() {
    if (this.languageLabelProxy) return this.languageLabelProxy

    this.languageLabelProxy = document.createElement('span')
    this.languageLabelProxy.classList.add('sr-only', 'js-language-label-proxy')
    this.languageLabelProxy.setAttribute('aria-hidden', 'true')
    this.languageLabelProxy.textContent = 'Language'
    document.body.appendChild(this.languageLabelProxy)

    return this.languageLabelProxy
  }

  translate(languageCode) {
    const language = languageOptions.find(({ code }) => code === languageCode)

    if (languageCode === 'en') {
      if (this.languageLabelProxy) this.languageLabelProxy.textContent = 'Language'
      this.resetGoogleTranslate()
      this.restoreOriginalText()
      this.updateLanguageLabels(language)
      this.syncTitle('')
      return
    }

    if (!window.google || !window.google.translate) {
      window.nswPendingLanguage = languageCode
      return
    }

    const googleSelect = document.querySelector('.goog-te-combo')
    if (!googleSelect) return

    googleSelect.value = languageCode
    googleSelect.dispatchEvent(new Event('change'))
    this.hideGoogleChrome()
    this.syncTitle(languageCode)
    if (language) this.queueLabelRefresh(language)
  }

  resetGoogleTranslate() {
    this.clearGoogleTranslateCookies()

    const googleSelect = document.querySelector('.goog-te-combo')
    if (googleSelect) {
      googleSelect.value = ''
      googleSelect.dispatchEvent(new Event('change'))
    }

    this.hideGoogleChrome()
  }

  clearGoogleTranslateCookies() {
    const domains = [window.location.hostname, `.${window.location.hostname}`]
    domains.forEach((domain) => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`
    })
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  }

  ensureTitleProxy() {
    if (this.titleProxy) return this.titleProxy

    this.titleProxy = document.createElement('span')
    this.titleProxy.classList.add('sr-only', 'js-language-title-proxy')
    this.titleProxy.textContent = this.originalTitle
    document.body.appendChild(this.titleProxy)

    return this.titleProxy
  }

  syncTitle(languageCode) {
    const titleProxy = this.ensureTitleProxy()

    if (!languageCode) {
      titleProxy.textContent = this.originalTitle
      document.title = this.originalTitle
      return
    }

    window.setTimeout(() => {
      const translatedTitle = titleProxy.textContent.trim()
      if (translatedTitle) document.title = translatedTitle
    }, 1500)
  }

  hideGoogleChrome() {
    document.querySelectorAll('body > .skiptranslate, iframe.goog-te-banner-frame, iframe.skiptranslate')
      .forEach((element) => {
        element.setAttribute('aria-hidden', 'true')
        element.style.display = 'none'
      })

    document.body.style.top = '0'
  }

  observeGoogleChrome() {
    if (this.googleChromeObserver) return

    this.googleChromeObserver = new MutationObserver(() => this.hideGoogleChrome())
    this.googleChromeObserver.observe(document.body, { childList: true, subtree: true })
  }

  loadGoogleTranslate() {
    if (window.nswGoogleTranslateLoading) return
    window.nswGoogleTranslateLoading = true

    const container = document.createElement('div')
    container.id = 'google_translate_element'
    container.hidden = true
    document.body.appendChild(container)

    window.googleTranslateElementInit = () => {
      const TranslateElement = window.google.translate.TranslateElement

      new TranslateElement({
        pageLanguage: 'en',
        includedLanguages: languageOptions.map(({ code }) => code).filter((code) => code !== 'en').join(','),
        autoDisplay: false,
      }, 'google_translate_element')

      this.hideGoogleChrome()

      if (window.nswPendingLanguage !== null && window.nswPendingLanguage !== undefined) {
        this.translate(window.nswPendingLanguage)
        window.nswPendingLanguage = null
      }
    }

    const script = document.createElement('script')
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.head.appendChild(script)
  }
}

export default LanguageControl
