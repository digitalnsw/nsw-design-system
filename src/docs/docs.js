function initDocs() {
  const codeButtons = document.querySelectorAll('.nsw-docs-code__button')

  codeButtons.forEach((button) => {
    const code = button.nextElementSibling
    const text = button.querySelector('span')

    button.addEventListener('click', (event) => {
      if (code.classList.contains('open')) {
        button.classList.remove('open')
        code.classList.remove('open')
        text.textContent = 'Show code'
      } else {
        button.classList.add('open')
        code.classList.add('open')
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
      if (list.classList.contains('open')) {
        button.classList.remove('open')
        list.classList.remove('open')
      } else {
        button.classList.add('open')
        list.classList.add('open')
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
      link.classList.add('active')

      if(!link.parentNode.classList.contains('nsw-docs-nav__title')) {
        const list = link.closest('ul')
        const button = list.previousElementSibling.querySelector('button')

        button.classList.add('open')
        button.classList.add('active')
        list.classList.add('open')
      }
    }
  })
}

initDocs();