document.addEventListener('click', (event) => {
  if (!event.target.matches('.showHTML')) return
  event.preventDefault()
  event.target.nextElementSibling.style.display = 'block'
  event.target.style.display = 'none'
}, false)
