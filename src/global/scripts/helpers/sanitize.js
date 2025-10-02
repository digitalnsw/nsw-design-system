/* eslint-disable */
const HAS_DOCUMENT = typeof document !== 'undefined'
// Clean and optionally whitelist HTML into a safe set of tags with no attributes.
// Usage:
//  - cleanHTML(str) -> returns safe HTML string
//  - cleanHTML(str, true) -> returns a DocumentFragment of safe nodes
//  - cleanHTML(str, false, { allowedTags: ['p','span','kbd','h1','h2','h3','h4','h5','h6'] })
//
// Notes:
//  - Always strips <script> and dangerous attributes (src/href javascript:, on*)
//  - If allowedTags is provided, ALL OTHER ELEMENTS are unwrapped (their children kept)
//  - All attributes are stripped from allowed elements to avoid XSS via attributes
function cleanHTML (str, nodes, opts = {}) {
  if (!HAS_DOCUMENT) {
    // In non-DOM environments, return a plain-text approximation
    return nodes ? null : String(str || '').replace(/<[^>]*>/g, '')
  }

  const { allowedTags = null } = opts

  function stringToHTML () {
    const parser = new DOMParser()
    const doc = parser.parseFromString(String(str || ''), 'text/html')
    return doc.body || document.createElement('body')
  }

  function removeScripts (root) {
    const scripts = root.querySelectorAll('script')
    for (const script of scripts) script.remove()
  }

  function isPossiblyDangerous (name, value) {
    const val = String(value || '').replace(/\s+/g, '').toLowerCase()
    if (['src', 'href', 'xlink:href'].includes(name)) {
      if (val.startsWith('javascript:') || val.startsWith('data:text/html')) return true
    }
    if (name && name.toLowerCase().startsWith('on')) return true
    return false
  }

  function stripAllAttributes (elem) {
    const atts = Array.from(elem.attributes)
    for (const { name } of atts) elem.removeAttribute(name)
  }

  function removeDangerousAttributes (elem) {
    const atts = Array.from(elem.attributes)
    for (const { name, value } of atts) {
      if (isPossiblyDangerous(name, value)) elem.removeAttribute(name)
    }
  }

  function sanitiseNode (node) {
    if (node.nodeType === Node.TEXT_NODE) return

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase()

      if (tag === 'script') {
        node.remove()
        return
      }

      if (Array.isArray(allowedTags)) {
        const allowed = allowedTags.includes(tag)
        if (!allowed) {
          const parent = node.parentNode
          if (parent) {
            while (node.firstChild) parent.insertBefore(node.firstChild, node)
            parent.removeChild(node)
            return
          }
        } else {
          // For allowed elements, remove all attributes (keeps tag, drops attrs)
          stripAllAttributes(node)
        }
      } else {
        // No whitelist provided: just strip dangerous attributes
        removeDangerousAttributes(node)
      }
    }

    const children = Array.from(node.childNodes || [])
    for (const child of children) sanitiseNode(child)
  }

  const body = stringToHTML()
  removeScripts(body)
  Array.from(body.childNodes).forEach((n) => sanitiseNode(n))

  if (nodes) {
    // Return a fragment for easy append: el.appendChild(cleanHTML(str, true))
    const frag = document.createDocumentFragment()
    while (body.firstChild) frag.appendChild(body.firstChild)
    return frag
  }

  return body.innerHTML
}

export default cleanHTML
