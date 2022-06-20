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

  const autoCompleteJS = new autoComplete({
    selector: "#nsw-header-input-autocomplete",
    wrapper: false,
    data: {
      src: async () => {
        try {
          // Loading placeholder text
          document
            .getElementById("nsw-header-input-autocomplete")
            .setAttribute("placeholder", "Loading...");
          // Fetch External Data Source
          const source = await fetch(
            "search.json"
          );
          const data = await source.json();
          // Post Loading placeholder text
          document
            .getElementById("nsw-header-input-autocomplete")
            .setAttribute("placeholder", autoCompleteJS.placeHolder);
          // Returns Fetched data
          return data;
        } catch (error) {
          return error;
        }
      },
      keys: ["title", "keywords"],
      cache: true,
      filter: (list) => {
        // Filter duplicates
        // incase of multiple data keys usage
        const filteredResults = Array.from(
          new Set(list.map((value) => value.match))
        ).map((title) => {
          return list.find((value) => value.match === title);
        });
        return filteredResults;
      }
    },
    placeHolder: "",
    threshold: 2,
    resultsList: {
      tag: "ul",
      id: "nsw-predictive-list",
      class: "nsw-form__predictive-list",
      noResults: true,
      destination: ".nsw-form__predictive",
      position: "beforeend",
      maxResults: 5,
      tabSelect: true,
      element: (list, data) => {
        if (!data.results.length) {
          // Create "No Results" message list element
          const message = document.createElement("li");
          message.setAttribute("class", "no-result");
          // Add message text content
          message.innerHTML = `<span>Found No Results for "${data.query}"</span>`;
          // Add message list element to the list
          list.appendChild(message);
        }
      },
      noResults: true
    },
    resultItem: {
      element: (item, data) => {
        item.innerHTML = `<li><a href="${data.value.url}">${data.value.title}</a></li>`;
        console.log(data);
      },
      highlight: true
    },
    events: {
      input: {
        focus: () => {
          if (autoCompleteJS.input.value.length) autoCompleteJS.start();
        }
      }
    }
  });

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
}

initDocs();