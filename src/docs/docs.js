function initDocs() {
  const codeButtons = document.querySelectorAll('.js-code-button')

  codeButtons.forEach((button) => {
    const code = button.nextElementSibling
    const text = button.querySelector('span')

    button.addEventListener('click', (event) => {
      if (code.classList.contains('active')) {
        button.classList.remove('active')
        code.classList.remove('active')
        text.textContent = 'Show code'
      } else {
        button.classList.add('active')
        code.classList.add('active')
        text.textContent = 'Hide code'
      }
    }, false)
  })

  const client = algoliasearch('C105ELLKR4', '7ce5bd509b1baf1182d8ce2a3033b684')
  const index = client.initIndex('test_index_upload')
  const myAutocomplete = autocomplete('#nsw-docs-header-input', { hint: false }, [
    {
      source: autocomplete.sources.hits(index, { hitsPerPage: 5 }),
      displayKey: 'title',
      templates: {
        suggestion(suggestion) {
          const pListTemplate = `<li><a href='${suggestion.url}'>${suggestion._highlightResult.title.value}</a></li>`
          return pListTemplate
        },
      },
    },
  ])

  const copyButtons = document.querySelectorAll('.js-code-copy')

  copyButtons.forEach((button) => {
    const code = button.closest('.nsw-docs-code').previousElementSibling.querySelector('.nsw-docs__component')
    const text = button.querySelector('span')

    button.addEventListener('click', (event) => {
      const elem = document.createElement('textarea')
      elem.value = code.innerHTML
      document.body.appendChild(elem)
      elem.select()
      document.execCommand('copy')
      document.body.removeChild(elem)

      text.textContent = 'Copied'

      setTimeout(() => {
        text.textContent = 'Copy'
      }, 2000)
    }, false)
  })

  const navLinks = document.querySelectorAll('.nsw-docs__nav a')
  let currentURL = window.location.pathname

  if (currentURL == '/' || currentURL == '/nsw-design-system-docs/') currentURL = '/home/index.html'

  navLinks.forEach((link) => {
    let linkURL = link.getAttribute('href')
    if (linkURL == '/' || linkURL == '/nsw-design-system-docs/') linkURL = '/home/index.html'

    if (currentURL.match(linkURL)) {
      link.classList.add('current')

      if (link.closest('ul').classList.contains('nsw-main-nav__sub-list')) {
        const list = link.closest('.nsw-main-nav__sub-nav')
        const button = list.previousElementSibling

        list.classList.add('current-section')
        button.classList.add('current-section')
        button.click()
      } else {
        link.classList.add('current-section')
      }
    }
  })
}

initDocs()
