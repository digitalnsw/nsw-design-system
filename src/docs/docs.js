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


  const copyButtons = document.querySelectorAll('.js-code-copy')

  copyButtons.forEach((button) => {
    const code = button.nextElementSibling
    const text = button.querySelector('span')
    const script = code.querySelector('script')

    script.remove()

    button.addEventListener('click', (event) => {
      const elem = document.createElement('textarea');
      elem.value = code.innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      document.body.appendChild(elem);
      elem.select();
      document.execCommand('copy');
      text.textContent = 'Copied'
      document.body.removeChild(elem);

      setTimeout(function() {
        text.textContent = 'Copy'
      }, 2000)
    }, false)
  })

  const navLinks = document.querySelectorAll('.nsw-docs__nav a')
  var currentURL = window.location.pathname

  if (currentURL == '/' || currentURL == '/nsw-design-system/') currentURL = '/home/index.html'

  navLinks.forEach((link) => {
    var linkURL = link.getAttribute('href')
    if (linkURL == '/' || linkURL == '/nsw-design-system/') linkURL = '/home/index.html'

    if (currentURL.match(linkURL)) {
      link.classList.add('current')

      if(link.closest('ul').classList.contains('nsw-main-nav__sub-list')) {
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

  let searchData = []

  fetch('/docs/js/search.json')
    .then((response) => response.json())
    .then((data) => {
      searchData = data
    })

  const autocomplete = document.querySelector('.nsw-autocomplete')
  const autocompleteInput = autocomplete.querySelector('.nsw-autocomplete__input')
  const autocompleteNoResult = autocomplete.querySelector('.nsw-autocomplete__no-result')

  let autocompleteInputValue = ''

  const newAutocomplete = new Autocomplete(autocomplete, {

    search: (input) => {
      autocompleteInputValue = input
      if (input.length < 1) { return [] }
      return searchData.filter((item) => item.title.toLowerCase().includes(input.toLowerCase())
      || item.keywords.toLowerCase().includes(input.toLowerCase()))
    },

    renderResult: (result, props) => `
      <li ${props}>
        <a href="${result.url}">
          ${result.title}
        </a>
      </li>
    `,

    onUpdate: (results) => {
      if (autocompleteInputValue && results.length === 0) {
        autocompleteNoResult.classList.add('show')
      } else {
        autocompleteNoResult.classList.remove('show')
      }
    },

    getResultValue: (result) => result.title,

    onSubmit: (result) => {
      autocompleteNoResult.classList.remove('show')
    },
  })

  autocompleteInput.addEventListener('focus', () => {
    autocompleteNoResult.classList.add('active')
  })

  autocompleteInput.addEventListener('blur', () => {
    autocompleteNoResult.classList.remove('active')
  })
}

initDocs();
