import Autocomplete from './autocomplete'
import ExpandableSearch from './expandable-search'
import DownloadPDF from './download-pdf'
import ColorSwatches from './color-swatches'

function initDocs() {
  const codeButtons = document.querySelectorAll('.js-code-button')

  codeButtons.forEach((button) => {
    const code = button.nextElementSibling
    const text = button.querySelector('span')

    button.addEventListener('click', () => {
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
      const elem = document.createElement('textarea')
      elem.value = code.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      document.body.appendChild(elem)
      elem.select()
      document.execCommand('copy')
      text.textContent = 'Copied'
      document.body.removeChild(elem)

      setTimeout(() => {
        text.textContent = 'Copy'
      }, 2000)
    }, false)
  })

  const navLinks = document.querySelectorAll('.nsw-docs__nav a')
  let currentURL = window.location.pathname

  if (currentURL === '/') currentURL = '/home/index.html'

  navLinks.forEach((link) => {
    let linkURL = link.getAttribute('href')
    if (linkURL == '/') linkURL = '/home/index.html'
    if (linkURL.includes('https://designsystem.digital.nsw.gov.au')) linkURL = linkURL.replace('https://designsystem.digital.nsw.gov.au', '')

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

  const autoComplete = document.querySelectorAll('.js-autocomplete')

  if (autoComplete) {
    autoComplete.forEach((element) => {
      new Autocomplete(element).init()
    })
  }

  const expandableSearch = document.querySelectorAll('.js-header')

  if (expandableSearch) {
    expandableSearch.forEach((element) => {
      new ExpandableSearch(element).init()
    })
  }

  const downloadPDF = document.querySelectorAll('.js-download-page')

  if (downloadPDF) {
    downloadPDF.forEach((element) => {
      new DownloadPDF(element).init()
    })
  }

  const options = {
    blue: {
      val: 'Blue 01',
      hex: '#002664',
      content: {
        'Brand Dark': {
          hex: 'Blue 01 <code>#002664</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Blue 04 <code>#CBEDFD</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Blue 02 <code>#146CFD</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Red 02 <code>#D7153A</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#002664</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#551A8B</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(0, 38, 100, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(0, 38, 100, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#0086B3</code>',
          var: '--nsw-focus',
        },
      },
    },
    purple: {
      val: 'Purple 01',
      hex: '#441170',
      content: {
        'Brand Dark': {
          hex: 'Purple 01 <code>#441170</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Purple 04 <code>#E6E1FD</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Purple 02 <code>#8055F1</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Yellow 02 <code>#FAAF05</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#441170</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#70114D</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(68, 17, 112, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(68, 17, 112, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#351BB5</code>',
          var: '--nsw-focus',
        },
      },
    },
    fuchsia: {
      val: 'Fuchsia 01',
      hex: '#65004D',
      content: {
        'Brand Dark': {
          hex: 'Fuchsia 01 <code>#65004D</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Fuchsia 04 <code>#F0E6ED</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Fuchsia 02 <code>#D912AE</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Orange 02 <code>#F3631B</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#65004D</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#983379</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(101, 0, 77, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(101, 0, 77, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#9D00B4</code>',
          var: '--nsw-focus',
        },
      },
    },
    red: {
      val: 'Red 01',
      hex: '#630019',
      content: {
        'Brand Dark': {
          hex: 'Red 01 <code>#630019</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Red 04 <code>#FFE6EA</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Red 02 <code>#D7153A</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Brown 02 <code>#B68D5D</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#630019</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#9C3D1B</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(99, 0, 25, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(99, 0, 25, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#B2006E</code>',
          var: '--nsw-focus',
        },
      },
    },
    orange: {
      val: 'Orange 01',
      hex: '#941B00',
      content: {
        'Brand Dark': {
          hex: 'Orange 01 <code>#941B00</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Orange 04 <code>#FDEDDF</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Orange 02 <code>#F3631B</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Purple 02 <code>#8055F1</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#941B00</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#7D4D27</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(148, 27, 0, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(148, 27, 0, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#E3002A</code>',
          var: '--nsw-focus',
        },
      },
    },
    brown: {
      val: 'Brown 01',
      hex: '#523719',
      content: {
        'Brand Dark': {
          hex: 'Brown 01 <code>#523719</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Brown 04 <code>#EDE3D7</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Brown 02 <code>#B68D5D</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Teal 02 <code>#2E808E</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#523719</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#914132</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(82, 55, 25, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(82, 55, 25, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#8F3B2B</code>',
          var: '--nsw-focus',
        },
      },
    },
    yellow: {
      val: 'Yellow 01',
      hex: '#694800',
      content: {
        'Brand Dark': {
          hex: 'Yellow 01 <code>#694800</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Yellow 04 <code>#FFF4CF</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Yellow 02 <code>#FAAF05</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Green 02 <code>#00AA45</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#694800</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#5B5A16</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(105, 72, 0, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(105, 72, 0, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#B83B00</code>',
          var: '--nsw-focus',
        },
      },
    },
    green: {
      val: 'Green 01',
      hex: '#004000',
      content: {
        'Brand Dark': {
          hex: 'Green 01 <code>#004000</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Green 04 <code>#DBFADF</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Green 02 <code>#00AA45</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Blue 02 <code>#146CFD</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#004000</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#016740</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(0, 64, 0, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(0, 64, 0, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#348F00</code>',
          var: '--nsw-focus',
        },
      },
    },
    teal: {
      val: 'Teal 01',
      hex: '#0B3F47',
      content: {
        'Brand Dark': {
          hex: 'Teal 01 <code>#0B3F47</code>',
          var: '--nsw-brand-dark',
        },
        'Brand Light': {
          hex: 'Teal 04 <code>#D1EEEA</code>',
          var: '--nsw-brand-light',
        },
        'Brand Supplementary': {
          hex: 'Teal 02 <code>#2E808E</code>',
          var: '--nsw-brand-supplementary',
        },
        'Brand Accent': {
          hex: 'Fuchsia 02 <code>#D912AE</code>',
          var: '--nsw-brand-accent',
        },
        'Link colour': {
          hex: '<code>#0B3F47</code>',
          var: '--nsw-link',
        },
        'Visited link colour': {
          hex: '<code>#265E76</code>',
          var: '--nsw-visited',
        },
        'Hover background colour': {
          hex: '<code>rgba(11, 63, 71, 0.1)</code>',
          var: '--nsw-hover',
        },
        'Active background colour': {
          hex: '<code>rgba(11, 63, 71, 0.2)</code>',
          var: '--nsw-active',
        },
        'Focus outline colour': {
          hex: '<code>#168B70</code>',
          var: '--nsw-focus',
        },
      },
    },
  }

  const colorSwatches = document.querySelectorAll('.js-color-swatches')

  if (colorSwatches) {
    colorSwatches.forEach((element) => {
      new ColorSwatches(element, options).init()
    })
  }

  const partial = {
    'blue-accent': {
      val: 'Blue 02',
      hex: '#146CFD',
      content: {
        'Brand Accent': {
          hex: 'Blue 02 <code>#146CFD</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'purple-accent': {
      val: 'Purple 01',
      hex: '#8055F1',
      content: {
        'Brand Accent': {
          hex: 'Purple 02 <code>#8055F1</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'fuchsia-accent': {
      val: 'Fuchsia 02',
      hex: '#D912AE',
      content: {
        'Brand Accent': {
          hex: 'Fuchsia 02 <code>#D912AE</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'red-accent': {
      val: 'Red 02',
      hex: '#D7153A',
      content: {
        'Brand Accent': {
          hex: 'Red 02 <code>#D7153A</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'orange-accent': {
      val: 'Orange 02',
      hex: '#F3631B',
      content: {
        'Brand Accent': {
          hex: 'Orange 02 <code>#F3631B</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'brown-accent': {
      val: 'Brown 02',
      hex: '#B68D5D',
      content: {
        'Brand Accent': {
          hex: 'Brown 02 <code>#B68D5D</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'yellow-accent': {
      val: 'Yellow 02',
      hex: '#FAAF05',
      content: {
        'Brand Accent': {
          hex: 'Yellow 02 <code>#FAAF05</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'green-accent': {
      val: 'Green 02',
      hex: '#00AA45',
      content: {
        'Brand Accent': {
          hex: 'Green 02 <code>#00AA45</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
    'teal-accent': {
      val: 'Teal 02',
      hex: '#2E808E',
      content: {
        'Brand Accent': {
          hex: 'Teal 02 <code>#2E808E</code>',
          var: '--nsw-brand-accent',
        },
      },
    },
  }

  const colorSwatch = document.querySelectorAll('.js-color-swatch')

  if (colorSwatch) {
    colorSwatch.forEach((element) => {
      new ColorSwatches(element, partial).init()
    })
  }
}

initDocs()
