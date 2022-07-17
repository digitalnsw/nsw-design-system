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

  let inputValue = ''
  let showNoResults = false

  const autocomplete = document.querySelector('#autocomplete')
  const input = document.querySelector('.autocomplete-input')

  /* eslint-disable */
  new Autocomplete('#autocomplete', {

    search: (input) => {
      const url = '/docs/search.json'
      inputValue = input

      return new Promise((resolve) => {
        if (input.length < 1) { return resolve([]) }

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            resolve(data.filter((item) =>
              item.title.toLowerCase().includes(input.toLowerCase()) || item.keywords.toLowerCase().includes(input.toLowerCase()),
            ))
          })
      })
    },

    renderResult: (result, props) => `
      <li ${props}>
        <a href="${result.url}">
          ${result.title}
        </a>
      </li>
    `,

    onUpdate: (results) => {
      showNoResults = inputValue && results.length === 0

      if (showNoResults) {
        autocomplete.classList.add('no-results')
        input.setAttribute('aria-describedby', 'no-results')
      } else {
        autocomplete.classList.remove('no-results')
        input.removeAttribute('aria-describedby')
      }
    },

    getResultValue: (result) => result.title,

    onSubmit: (result) => {
      window.open(`${result.url}`, '_self')
    },
  })

  input.addEventListener('focus', () => {
    input.classList.add('focused')
  })

  input.addEventListener('blur', () => {
    input.classList.remove('focused')
  })
}

initDocs()
