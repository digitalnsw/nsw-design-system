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
    const sanitisedURL = new URL(linkURL, window.location.origin)
    linkURL = sanitisedURL.pathname + sanitisedURL.search + sanitisedURL.hash

    if (linkURL === '/') linkURL = '/home/index.html'
    
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

  const colorConfig = {
    variables: {
      'brand-dark': '--nsw-brand-dark',
      'brand-light': '--nsw-brand-light',
      'brand-supplementary': '--nsw-brand-supplementary',
      'brand-accent': '--nsw-brand-accent',
      'link-colour': '--nsw-link',
      'visited-link-colour': '--nsw-visited',
      'hover-background-colour': '--nsw-hover',
      'active-background-colour': '--nsw-active',
      'focus': '--nsw-focus',
    },
    palettes: {
      'original-palette': {
        blue: {
          val: '#002664',
          'brand-dark': '#002664',
          'brand-light': '#CBEDFD',
          'brand-supplementary': '#146CFD',
          'brand-accent': '#D7153A',
          'link-colour': '#002664',
          'visited-link-colour': '#551A8B',
          'hover-background-colour': 'rgba(0, 38, 100, 0.1)',
          'active-background-colour': 'rgba(0, 38, 100, 0.2)',
          'focus': '#0086B3',
        },
        purple: {
          val: '#441170',
          'brand-dark': '#441170',
          'brand-light': '#E6E1FD',
          'brand-supplementary': '#8055F1',
          'brand-accent': '#FAAF05',
          'link-colour': '#441170',
          'visited-link-colour': '#70114D',
          'hover-background-colour': 'rgba(68, 17, 112, 0.1)',
          'active-background-colour': 'rgba(68, 17, 112, 0.2)',
          'focus': '#351BB5',
        },
        fuchsia: {
          val: '#65004D',
          'brand-dark': '#65004D',
          'brand-light': '#F0E6ED',
          'brand-supplementary': '#D912AE',
          'brand-accent': '#F3631B',
          'link-colour': '#65004D',
          'visited-link-colour': '#983379',
          'hover-background-colour': 'rgba(101, 0, 77, 0.1)',
          'active-background-colour': 'rgba(101, 0, 77, 0.2)',
          'focus': '#9D00B4',
        },
        red: {
          val: '#630019',
          'brand-dark': '#630019',
          'brand-light': '#FFE6EA',
          'brand-supplementary': '#D7153A',
          'brand-accent': '#B68D5D',
          'link-colour': '#630019',
          'visited-link-colour': '#9C3D1B',
          'hover-background-colour': 'rgba(99, 0, 25, 0.1)',
          'active-background-colour': 'rgba(99, 0, 25, 0.2)',
          'focus': '#B2006E',
        },
        orange: {
          val: '#941B00',
          'brand-dark': '#941B00',
          'brand-light': '#FDEDDF',
          'brand-supplementary': '#F3631B',
          'brand-accent': '#8055F1',
          'link-colour': '#941B00',
          'visited-link-colour': '#7D4D27',
          'hover-background-colour': 'rgba(148, 27, 0, 0.1)',
          'active-background-colour': 'rgba(148, 27, 0, 0.2)',
          'focus': '#E3002A',
        },
        brown: {
          val: '#523719',
          'brand-dark': '#523719',
          'brand-light': '#EDE3D7',
          'brand-supplementary': '#B68D5D',
          'brand-accent': '#2E808E',
          'link-colour': '#523719',
          'visited-link-colour': '#914132',
          'hover-background-colour': 'rgba(82, 55, 25, 0.1)',
          'active-background-colour': 'rgba(82, 55, 25, 0.2)',
          'focus': '#8F3B2B',
        },
        yellow: {
          val: '#694800',
          'brand-dark': '#694800',
          'brand-light': '#FFF4CF',
          'brand-supplementary': '#FAAF05',
          'brand-accent': '#00AA45',
          'link-colour': '#694800',
          'visited-link-colour': '#5B5A16',
          'hover-background-colour': 'rgba(105, 72, 0, 0.1)',
          'active-background-colour': 'rgba(105, 72, 0, 0.2)',
          'focus': '#B83B00',
        },
        green: {
          val: '#004000',
          'brand-dark': '#004000',
          'brand-light': '#DBFADF',
          'brand-supplementary': '#00AA45',
          'brand-accent': '#146CFD',
          'link-colour': '#004000',
          'visited-link-colour': '#016740',
          'hover-background-colour': 'rgba(0, 64, 0, 0.1)',
          'active-background-colour': 'rgba(0, 64, 0, 0.2)',
          'focus': '#348F00',
        },
        teal: {
          val: '#0B3F47',
          'brand-dark': '#0B3F47',
          'brand-light': '#D1EEEA',
          'brand-supplementary': '#2E808E',
          'brand-accent': '#D912AE',
          'link-colour': '#0B3F47',
          'visited-link-colour': '#265E76',
          'hover-background-colour': 'rgba(11, 63, 71, 0.1)',
          'active-background-colour': 'rgba(11, 63, 71, 0.2)',
          'focus': '#168B70',
        },
      },
      'aboriginal-palette': {
        red: {
          val: '#950906', // Red A (Deep red from Row 01)
          'brand-dark': '#950906', // Row 01 (Strong, deep red for identity)
          'brand-light': '#FDD9D9', // Red D (Soft pastel red for readability)
          'brand-supplementary': '#E1261C', // Red B (Bright, high-contrast red)
          'brand-accent': '#0D6791', // Blue B (Cool, high-contrast accent)
          'link-colour': '#950906', // Red A (Deep red for consistency)
          'visited-link-colour': '#472642', // Purple A (Deep purple for contrast)
          'hover-background-colour': 'rgba(149, 9, 6, 0.1)', // Red A (Subtle hover effect)
          'active-background-colour': 'rgba(149, 9, 6, 0.2)', // Red A (Stronger interaction)
          'focus': '#E1261C', // Red B (Bright red focus for accessibility)
        },
        orange: {
          val: '#882600',
          'brand-dark': '#882600', // Deep Burnt Orange (Row 01)
          'brand-light': '#f9d4be', // Soft Orange (Row 04)
          'brand-supplementary': '#EE6314', // Orange B (Bright, energetic contrast)
          'brand-accent': '#84C5D1',
          'link-colour': '#882600', // Deep Burnt Orange (Row 01)
          'visited-link-colour': '#472642', // Purple A (Deep purple for contrast)
          'hover-background-colour': 'rgba(136, 38, 0, 0.1)',
          'active-background-colour': 'rgba(136, 38, 0, 0.2)',
          'focus': '#EE6314', // Deep Orange (Row 02)
        },
        brown: {
          val: '#552105', // Brown A (Deep earthy brown from Row 01)
          'brand-dark': '#552105', // Row 01 (Strong brown for identity)
          'brand-light': '#E9C8B2', // Brown D (Soft warm brown for readability)
          'brand-supplementary': '#9E5332', // Brown B (Darker contrast colour for accessibility)
          'brand-accent': '#0D6791', // Blue B (Cool, high-contrast accent)
          'link-colour': '#552105', // Brown A (Deep brown for consistency)
          'visited-link-colour': '#9A5E93', // Purple B (Deep purple for contrast)
          'hover-background-colour': 'rgba(85, 33, 5, 0.1)', // Brown A (Subtle hover effect)
          'active-background-colour': 'rgba(85, 33, 5, 0.2)', // Brown A (Stronger interaction)
          'focus': '#9E5332', // Brown B (Deep, warm focus indicator)
        },
        yellow: {
          val: '#895E00', // Yellow A (Deep Golden Yellow from Row 01)
          'brand-dark': '#895E00', // Row 01 (Strong Golden Brown for identity)
          'brand-light': '#FFF1C5', // Row 04 (Soft but warm light yellow for readability)
          'brand-supplementary': '#FEA927', // Brown B (Darker contrast colour for accessibility)
          'brand-accent': '#E1261C', // Orange B (Bright, high-contrast accent)
          'link-colour': '#895E00', // Yellow A (Deep golden yellow for consistency)
          'visited-link-colour': '#472642', // **Purple A (Deep & rich, high contrast)**
          'hover-background-colour': 'rgba(137, 94, 0, 0.1)', // **Based on `brand-dark` (#895E00)**
          'active-background-colour': 'rgba(137, 94, 0, 0.2)', // **Stronger version of `brand-dark`**
          'focus': '#895E00', // Row 01 (Strong Golden Brown for identity)
        },
        green: {
          val: '#215834', // Green A (Deep forest green from Row 01)
          'brand-dark': '#215834', // Row 01 (Strong dark green for identity)
          'brand-light': '#DAE6D1', // Row 04 (Soft muted green for readability)
          'brand-supplementary': '#78A146', // Brown A (Darker contrast colour for accessibility)
          'brand-accent': '#9E5332', // Brown B (Deep, complementary contrast)
          'link-colour': '#215834', // Green A (Deep green, consistent across palette)
          'visited-link-colour': '#472642', // Purple A (Deep purple for contrast)
          'hover-background-colour': 'rgba(33, 88, 52, 0.1)', // Green A (Subtle transparency)
          'active-background-colour': 'rgba(33, 88, 52, 0.2)', // Green A (Stronger interaction)
          'focus': '#78A146', // Green B (Distinct but aligned focus colour)
        },
        blue: {
          val: '#162953', // Blue A (Deep navy blue from Row 01)
          'brand-dark': '#162953', // Row 01 (Primary deep blue for identity)
          'brand-light': '#C1E2E8', // Blue D (Soft, cool, readable light blue)
          'brand-supplementary': '#0D6791', // Blue B (Darker blue for contrast)
          'brand-accent': '#EE6314', // Orange B (Vibrant accent for highlights)
          'link-colour': '#0D6791', // Blue B (Deep blue for readability)
          'visited-link-colour':  '#9A5E93', // Purple B (Deep purple for contrast)
          'hover-background-colour': 'rgba(22, 41, 83, 0.1)', // Blue A (Subtle hover effect)
          'active-background-colour': 'rgba(22, 41, 83, 0.2)', // Blue A (Stronger interaction)
          'focus': '#0D6791', // Blue B (Deep blue for focus indicator)
        },
        purple: {
          val: '#472642', // Purple A (Deep plum from Row 01)
          'brand-dark': '#472642', // Row 01 (Strong, rich purple for identity)
          'brand-light': '#E4CCE0', // Purple D (Soft, muted lavender for readability)
          'brand-supplementary': '#9A5E93', // Purple B (Darker contrast for depth)
          'brand-accent': '#EE6314', // Orange B (Warm, energetic contrast)
          'link-colour': '#472642', // Purple B (Maintains cohesion in text elements)
          'visited-link-colour': '#9A5E93', // Brown A (Strong contrast with background)
          'hover-background-colour': 'rgba(71, 38, 66, 0.1)', // Purple A (Subtle hover effect)
          'active-background-colour': 'rgba(71, 38, 66, 0.2)', // Purple A (Stronger interaction)
          'focus': '#EE6314', // Orange B (High-contrast, warm focus indicator)
        },
        grey: {
          val: '#2D2D2D', // Grey A (Deep neutral grey from Row 01)
          'brand-dark': '#2D2D2D', // Row 01 (Strong, dark grey for identity)
          'brand-light': '#E5E3E0', // Grey D (Soft warm grey for readability)
          'brand-supplementary': '#895E00', // Yellow A (Deep ochre for contrast)
          'brand-accent': '#FEA927', // Yellow B (Warm, energetic contrast)
          'link-colour': '#2D2D2D', // Grey A (Neutral grey for consistency)
          'visited-link-colour': '#472642', // Purple A (Muted contrast, adds depth)
          'hover-background-colour': 'rgba(45, 45, 45, 0.1)', // Grey A (Subtle hover effect)
          'active-background-colour': 'rgba(45, 45, 45, 0.2)', // Grey A (Stronger interaction)
          'focus': '#895E00', // Yellow A (Deep ochre for focus indicator)
        },
      },
    }
  };

   // Partial theming (accent-only, updates brand-accent without affecting others)
   const accentConfig = {
    variables: {
      'brand-accent': '--nsw-brand-accent',
    },
    palettes: {
      'original-palette': {
        blue: { val: '#146CFD', 'brand-accent': '#146CFD' },
        purple: { val: '#8055F1', 'brand-accent': '#8055F1' },
        fuchsia: { val: '#D912AE', 'brand-accent': '#D912AE' },
        red: { val: '#D7153A', 'brand-accent': '#D7153A' },
        orange: { val: '#F3631B', 'brand-accent': '#F3631B' },
        brown: { val: '#B68D5D', 'brand-accent': '#B68D5D' },
        yellow: { val: '#FAAF05', 'brand-accent': '#FAAF05' },
        green: { val: '#00AA45', 'brand-accent': '#00AA45' },
        teal: { val: '#2E808E', 'brand-accent': '#2E808E' },
      },
      'aboriginal-palette': {
        red: { val: '#E1261C', 'brand-accent': '#E1261C' },
        orange: { val: '#EE6314', 'brand-accent': '#EE6314' },
        yellow: { val: '#FAAF05', 'brand-accent': '#FAAF05' },
        green: { val: '#4C8046', 'brand-accent': '#4C8046' },
        blue: { val: '#1E88E5', 'brand-accent': '#1E88E5' },
        purple: { val: '#6A1B9A', 'brand-accent': '#6A1B9A' },
        brown: { val: '#9E5332', 'brand-accent': '#9E5332' },
        grey: { val: '#555555', 'brand-accent': '#555555' },
      },
    },
  };

  // Initialise Color Swatches for full-page and content-only pages
  document.querySelectorAll('.js-color-swatches').forEach((element) => {
    new ColorSwatches(element, colorConfig).init();
  });

  // Initialise Color Swatches for partial re-theming (only updates brand-accent)
  document.querySelectorAll('.js-color-swatch[data-mode="accent-only"]').forEach((element) => {
    new ColorSwatches(element, accentConfig).init();
  });
}

initDocs()
