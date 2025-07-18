import Autocomplete from './autocomplete'
import ExpandableSearch from './expandable-search'
import DownloadPDF from './download-pdf'
import ColorSwatches from './color-swatches'

// Prevent icon flash: hide icons until font loads
document.documentElement.classList.add('material-icons-loading')

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

    button.addEventListener('click', () => {
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
      'brand-accent-light': '--nsw-brand-accent-light',
      'link-colour': '--nsw-link',
      'visited-link-colour': '--nsw-visited',
      'hover-background-colour': '--nsw-hover',
      'active-background-colour': '--nsw-active',
      focus: '--nsw-focus',
    },
    palettes: {
      default: {
        label: 'Default Palette',
        'Blue 01': {
          val: '#002664',
          'brand-dark': { label: 'Blue 01', value: '#002664' },
          'brand-light': { label: 'Blue 04', value: '#CBEDFD' },
          'brand-supplementary': { label: 'Blue 02', value: '#146CFD' },
          'brand-accent': { label: 'Red 02', value: '#D7153A' },
          'brand-accent-light': { label: 'Red 04', value: '#FFE6EA' },
          'link-colour': { label: 'Blue 01', value: '#002664' },
          'visited-link-colour': { label: '', value: '#551A8B' },
          'hover-background-colour': { label: '', value: 'rgba(0, 38, 100, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(0, 38, 100, 0.2)' },
          focus: { label: '', value: '#0086B3' },
        },
        'Purple 01': {
          val: '#441170',
          'brand-dark': { label: 'Purple 01', value: '#441170' },
          'brand-light': { label: 'Purple 04', value: '#E6E1FD' },
          'brand-supplementary': { label: 'Purple 02', value: '#8055F1' },
          'brand-accent': { label: 'Yellow 02', value: '#FAAF05' },
          'brand-accent-light': { label: 'Yellow 04', value: '#FFF4CF' },
          'link-colour': { label: 'Purple 01', value: '#441170' },
          'visited-link-colour': { label: '', value: '#70114D' },
          'hover-background-colour': { label: '', value: 'rgba(68, 17, 112, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(68, 17, 112, 0.2)' },
          focus: { label: '', value: '#351BB5' },
        },
        'Fuchsia 01': {
          val: '#65004D',
          'brand-dark': { label: 'Fuchsia 01', value: '#65004D' },
          'brand-light': { label: 'Fuchsia 04', value: '#F0E6ED' },
          'brand-supplementary': { label: 'Fuchsia 02', value: '#D912AE' },
          'brand-accent': { label: 'Orange 02', value: '#F3631B' },
          'brand-accent-light': { label: 'Orange 04', value: '#FDEDDF' },
          'link-colour': { label: 'Fuchsia 01', value: '#65004D' },
          'visited-link-colour': { label: '', value: '#983379' },
          'hover-background-colour': { label: '', value: 'rgba(101, 0, 77, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(101, 0, 77, 0.2)' },
          focus: { label: '', value: '#9D00B4' },
        },
        'Red 01': {
          val: '#630019',
          'brand-dark': { label: 'Red 01', value: '#630019' },
          'brand-light': { label: 'Red 04', value: '#FFE6EA' },
          'brand-supplementary': { label: 'Red 02', value: '#D7153A' },
          'brand-accent': { label: 'Brown 02', value: '#B68D5D' },
          'brand-accent-light': { label: 'Brown 04', value: '#EDE3D7' },
          'link-colour': { label: 'Red 01', value: '#630019' },
          'visited-link-colour': { label: '', value: '#9C3D1B' },
          'hover-background-colour': { label: '', value: 'rgba(99, 0, 25, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(99, 0, 25, 0.2)' },
          focus: { label: '', value: '#B2006E' },
        },
        'Orange 01': {
          val: '#941B00',
          'brand-dark': { label: 'Orange 01', value: '#941B00' },
          'brand-light': { label: 'Orange 04', value: '#FDEDDF' },
          'brand-supplementary': { label: 'Orange 02', value: '#F3631B' },
          'brand-accent': { label: 'Purple 02', value: '#8055F1' },
          'brand-accent-light': { label: 'Purple 04', value: '#E6E1FD' },
          'link-colour': { label: 'Orange 01', value: '#941B00' },
          'visited-link-colour': { label: '', value: '#7D4D27' },
          'hover-background-colour': { label: '', value: 'rgba(148, 27, 0, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(148, 27, 0, 0.2)' },
          focus: { label: '', value: '#E3002A' },
        },
        'Brown 01': {
          val: '#523719',
          'brand-dark': { label: 'Brown 01', value: '#523719' },
          'brand-light': { label: 'Brown 04', value: '#EDE3D7' },
          'brand-supplementary': { label: 'Brown 02', value: '#B68D5D' },
          'brand-accent': { label: 'Teal 02', value: '#2E808E' },
          'brand-accent-light': { label: 'Teal 04', value: '#D1EEEA' },
          'link-colour': { label: 'Brown 01', value: '#523719' },
          'visited-link-colour': { label: '', value: '#914132' },
          'hover-background-colour': { label: '', value: 'rgba(82, 55, 25, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(82, 55, 25, 0.2)' },
          focus: { label: '', value: '#8F3B2B' },
        },
        'Yellow 01': {
          val: '#694800',
          'brand-dark': { label: 'Yellow 01', value: '#694800' },
          'brand-light': { label: 'Yellow 04', value: '#FFF4CF' },
          'brand-supplementary': { label: 'Yellow 02', value: '#FAAF05' },
          'brand-accent': { label: 'Green 02', value: '#00AA45' },
          'brand-accent-light': { label: 'Green 04', value: '#DBFADF' },
          'link-colour': { label: 'Yellow 01', value: '#694800' },
          'visited-link-colour': { label: '', value: '#5B5A16' },
          'hover-background-colour': { label: '', value: 'rgba(105, 72, 0, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(105, 72, 0, 0.2)' },
          focus: { label: '', value: '#B83B00' },
        },
        'Green 01': {
          val: '#004000',
          'brand-dark': { label: 'Green 01', value: '#004000' },
          'brand-light': { label: 'Green 04', value: '#DBFADF' },
          'brand-supplementary': { label: 'Green 02', value: '#00AA45' },
          'brand-accent': { label: 'Blue 02', value: '#146CFD' },
          'brand-accent-light': { label: 'Blue 04', value: '#CBEDFD' },
          'link-colour': { label: 'Green 01', value: '#004000' },
          'visited-link-colour': { label: '', value: '#016740' },
          'hover-background-colour': { label: '', value: 'rgba(0, 64, 0, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(0, 64, 0, 0.2)' },
          focus: { label: '', value: '#348F00' },
        },
        'Teal 01': {
          val: '#0B3F47',
          'brand-dark': { label: 'Teal 01', value: '#0B3F47' },
          'brand-light': { label: 'Teal 04', value: '#D1EEEA' },
          'brand-supplementary': { label: 'Teal 02', value: '#2E808E' },
          'brand-accent': { label: 'Fuchsia 02', value: '#D912AE' },
          'brand-accent-light': { label: 'Fuchsia 04', value: '#FDDEF2' },
          'link-colour': { label: 'Teal 01', value: '#0B3F47' },
          'visited-link-colour': { label: '', value: '#265E76' },
          'hover-background-colour': { label: '', value: 'rgba(11, 63, 71, 0.1)' },
          'active-background-colour': { label: '', value: 'rgba(11, 63, 71, 0.2)' },
          focus: { label: '', value: '#168B70' },
        },
      },
      aboriginal: {
        label: 'Aboriginal Palette',
        'Earth-Red': {
          val: '#950906',
          'brand-dark': { label: 'Earth Red', value: '#950906' },
          'brand-light': { label: 'Galah Pink', value: '#FDD9D9' },
          'brand-supplementary': { label: 'Ember Red', value: '#E1261C' },
          'brand-accent': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'link-colour': { label: 'Earth Red', value: '#950906' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Earth Red', value: 'rgba(149, 9, 6, 0.1)' },
          'active-background-colour': { label: 'Earth Red', value: 'rgba(149, 9, 6, 0.2)' },
          focus: { label: 'Ember Red', value: '#E1261C' },
        },
        'Deep Orange': {
          val: '#882600',
          'brand-dark': { label: 'Deep Orange', value: '#882600' },
          'brand-light': { label: 'Sunset Orange', value: '#F9D4BE' },
          'brand-supplementary': { label: 'Orange Ochre', value: '#EE6314' },
          'brand-accent': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'link-colour': { label: 'Deep Orange', value: '#882600' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Deep Orange', value: 'rgba(136, 38, 0, 0.1)' },
          'active-background-colour': { label: 'Deep Orange', value: 'rgba(136, 38, 0, 0.2)' },
          focus: { label: 'Orange Ochre', value: '#EE6314' },
        },
        'Riverbed Brown': {
          val: '#552105',
          'brand-dark': { label: 'Riverbed Brown', value: '#552105' },
          'brand-light': { label: 'Macadamia Brown', value: '#E9C8B2' },
          'brand-supplementary': { label: 'Firewood Brown', value: '#9E5332' },
          'brand-accent': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'link-colour': { label: 'Riverbed Brown', value: '#552105' },
          'visited-link-colour': { label: 'Spirit Lilac', value: '#9A5E93' },
          'hover-background-colour': { label: 'Riverbed Brown', value: 'rgba(85, 33, 5, 0.1)' },
          'active-background-colour': { label: 'Riverbed Brown', value: 'rgba(85, 33, 5, 0.2)' },
          focus: { label: 'Firewood Brown', value: '#9E5332' },
        },
        'Bush Honey Yellow': {
          val: '#895E00',
          'brand-dark': { label: 'Bush Honey Yellow', value: '#895E00' },
          'brand-light': { label: 'Sunbeam Yellow', value: '#FFF1C5' },
          'brand-supplementary': { label: 'Sandstone Yellow', value: '#FEA927' },
          'brand-accent': { label: 'Spirit Lilac', value: '#9A5E93' },
          'brand-accent-light': { label: 'Dusk Purple', value: '#E4CCE0' },
          'link-colour': { label: 'Bush Honey Yellow', value: '#895E00' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Bush Honey Yellow', value: 'rgba(105, 72, 0, 0.1)' },
          'active-background-colour': { label: 'Bush Honey Yellow', value: 'rgba(105, 72, 0, 0.2)' },
          focus: { label: 'Saltwater Blue', value: '#0D6791' },
        },
        'Bushland Green': {
          val: '#215834',
          'brand-dark': { label: 'Bushland Green', value: '#215834' },
          'brand-light': { label: 'Saltbush Green', value: '#DAE6D1' },
          'brand-supplementary': { label: 'Marshland Lime', value: '#78A146' },
          'brand-accent': { label: 'Firewood Brown', value: '#9E5332' },
          'brand-accent-light': { label: 'Macadamia Brown', value: '#E9C8B2' },
          'link-colour': { label: 'Bushland Green', value: '#215834' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Bushland Green', value: 'rgba(33, 88, 52, 0.1)' },
          'active-background-colour': { label: 'Bushland Green', value: 'rgba(33, 88, 52, 0.2)' },
          focus: { label: 'Marshland Lime', value: '#78A146' },
        },
        'Billabong Blue': {
          val: '#162953',
          'brand-dark': { label: 'Billabong Blue', value: '#00405E' },
          'brand-light': { label: 'Coastal Blue', value: '#C1E2E8' },
          'brand-supplementary': { label: 'Saltwater Blue', value: '#0D6791' },
          'brand-accent': { label: 'Orange Ochre', value: '#EE6314' },
          'brand-accent-light': { label: 'Sunset Orange', value: '#F9D4BE' },
          'link-colour': { label: 'Saltwater Blue', value: '#0D6791' },
          'visited-link-colour': { label: 'Spirit Lilac', value: '#9A5E93' },
          'hover-background-colour': { label: 'Billabong Blue', value: 'rgba(0, 64, 94, 0.1)' },
          'active-background-colour': { label: 'Billabong Blue', value: 'rgba(0, 64, 94, 0.2)' },
          focus: { label: 'Saltwater Blue', value: '#0D6791' },
        },
        'Bush Plum': {
          val: '#472642',
          'brand-dark': { label: 'Bush Plum', value: '#472642' },
          'brand-light': { label: 'Dusk Purple', value: '#E4CCE0' },
          'brand-supplementary': { label: 'Spirit Lilac', value: '#9A5E93' },
          'brand-accent': { label: 'Orange Ochre', value: '#EE6314' },
          'brand-accent-light': { label: 'Sunset Orange', value: '#F9D4BE' },
          'link-colour': { label: 'Bush Plum', value: '#472642' },
          'visited-link-colour': { label: 'Spirit Lilac', value: '#9A5E93' },
          'hover-background-colour': { label: 'Bush Plum', value: 'rgba(71, 38, 66, 0.1)' },
          'active-background-colour': { label: 'Bush Plum', value: 'rgba(71, 38, 66, 0.2)' },
          focus: { label: 'Orange Ochre', value: '#EE6314' },
        },
        'Charcoal Grey': {
          val: '#2D2D2D',
          'brand-dark': { label: 'Charcoal Grey', value: '#272727' },
          'brand-light': { label: 'Smoke Grey', value: '#E5E3E0' },
          'brand-supplementary': { label: 'Bush Honey Yellow', value: '#694800' },
          'brand-accent': { label: 'Sandstone Yellow', value: '#FEA927' },
          'brand-accent-light': { label: 'Sunbeam Yellow', value: '#FFF1C5' },
          'link-colour': { label: 'Charcoal Grey', value: '#272727' },
          'visited-link-colour': { label: 'Bush Plum', value: '#472642' },
          'hover-background-colour': { label: 'Charcoal Grey', value: 'rgba(39, 39, 39, 0.1)' },
          'active-background-colour': { label: 'Charcoal Grey', value: 'rgba(39, 39, 39, 0.2)' },
          focus: { label: 'Sandstone Yellow', value: '#FEA927' },
        },
      },
    },
  }

  // Partial theming (accent-only, updates brand-accent without affecting others)
  const accentConfig = {
    variables: {
      'brand-accent': '--nsw-brand-accent',
    },
    palettes: {
      'Default Palette': {
        'Blue 02': { val: '#146CFD', 'brand-accent': '#146CFD' },
        'Purple 02': { val: '#8055F1', 'brand-accent': '#8055F1' },
        'Fuchsia 02': { val: '#D912AE', 'brand-accent': '#D912AE' },
        'Red 02': { val: '#D7153A', 'brand-accent': '#D7153A' },
        'Orange 02': { val: '#F3631B', 'brand-accent': '#F3631B' },
        'Brown 02': { val: '#B68D5D', 'brand-accent': '#B68D5D' },
        'Yellow 02': { val: '#FAAF05', 'brand-accent': '#FAAF05' },
        'Green 02': { val: '#00AA45', 'brand-accent': '#00AA45' },
        'Teal 02': { val: '#2E808E', 'brand-accent': '#2E808E' },
      },
      'Aboriginal Palette': {
        'Ember Red': { val: '#E1261C', 'brand-accent': '#E1261C' },
        'Orange Ochre': { val: '#EE6314', 'brand-accent': '#EE6314' },
        'Firewood Brown': { val: '#9E5332', 'brand-accent': '#9E5332' },
        'Sandstone Yellow': { val: '#FEA927', 'brand-accent': '#FEA927' },
        'Marshland Lime': { val: '#78A146', 'brand-accent': '#78A146' },
        'Saltwater Blue': { val: '#0D6791', 'brand-accent': '#0D6791' },
        'Spirit Lilac': { val: '#9A5E93', 'brand-accent': '#9A5E93' },
        'Emu Grey': { val: '#555555', 'brand-accent': '#555555' },
      },
    },
  }

  // Initialise Color Swatches for full-page and content-only pages
  document.querySelectorAll('.js-color-swatches').forEach((element) => {
    new ColorSwatches(element, colorConfig).init()
  })

  // Initialise Color Swatches for partial re-theming (only updates brand-accent)
  document.querySelectorAll('.js-color-swatch[data-mode="accent-only"]').forEach((element) => {
    new ColorSwatches(element, accentConfig).init()
  })
}

initDocs()

// Show icons when Material Icons font is ready
function handleIconsReady() {
  document.documentElement.classList.remove('material-icons-loading')
  document.documentElement.classList.add('material-icons-loaded')
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(handleIconsReady)
} else {
  window.addEventListener('load', handleIconsReady)
}
