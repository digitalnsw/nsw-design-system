function initDocs() {
  const codeButtons = document.querySelectorAll('.nsw-docs-code__button')

  codeButtons.forEach((button) => {
    const code = button.nextElementSibling
    const text = button.querySelector('span')

    button.addEventListener('click', (event) => {
      if (code.classList.contains('is-open')) {
        button.classList.remove('is-open')
        code.classList.remove('is-open')
        text.textContent = 'Show code'
      } else {
        button.classList.add('is-open')
        code.classList.add('is-open')
        text.textContent = 'Hide code'
      }
    }, false)    
  })


  const copyButtons = document.querySelectorAll('.nsw-docs-code__copy')

  copyButtons.forEach((button) => {
    const code = button.closest('.nsw-docs-code').previousElementSibling.querySelector('.nsw-docs__component')
    const text = button.querySelector('span')

    button.addEventListener('click', (event) => {
      const elem = document.createElement('textarea');
      elem.value = code.innerHTML;
      document.body.appendChild(elem);
      elem.select();
      document.execCommand('copy');
      document.body.removeChild(elem);

      text.textContent = 'Copied'

      setTimeout(function() {
        text.textContent = 'Copy'
      }, 2000)
    }, false)
  })

  const navAccordions = document.querySelectorAll('.nsw-docs-nav__list')

  navAccordions.forEach((list) => {
    const button = list.previousElementSibling.querySelector('button')

    button.addEventListener('click', (event) => {
      if (list.classList.contains('is-open')) {
        button.classList.remove('is-open')
        list.classList.remove('is-open')
      } else {
        button.classList.add('is-open')
        list.classList.add('is-open')
      }
    }, false)    
  })

  const navLinks = document.querySelectorAll('.nsw-docs-nav a')
  var currentURL = window.location.pathname

  if (currentURL == '/' || currentURL == '/nsw-design-system-docs/') currentURL = '/home/index.html'

  navLinks.forEach((link) => {
    var linkURL = link.getAttribute('href')
    if (linkURL == '/' || linkURL == '/nsw-design-system-docs/') linkURL = '/home/index.html'

    if (currentURL.match(linkURL)) {
      link.classList.add('is-active')

      if(!link.parentNode.classList.contains('nsw-docs-nav__title')) {
        const list = link.closest('ul')
        const button = list.previousElementSibling.querySelector('button')

        button.classList.add('is-open')
        button.classList.add('is-active')
        list.classList.add('is-open')
      }
    }
  })
}

initDocs();