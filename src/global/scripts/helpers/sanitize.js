const HAS_DOCUMENT = typeof document !== 'undefined'

function escapeHTML(txt) {
  const str = String(txt || '')
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Clean and optionally whitelist HTML into a safe set of tags with no attributes.
function baseCleanHTML(str, nodes, opts = {}) {
  if (!HAS_DOCUMENT) {
    // In non-DOM environments, return safely-escaped text (no HTML interpretation)
    return nodes ? null : escapeHTML(str)
  }

  const { allowedTags = null } = opts

  function stringToHTML() {
    // Pre-strip <script> blocks; use textContent to avoid HTML interpretation if no allowlist
    const raw = String(str || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    if (!Array.isArray(allowedTags)) {
      const bodyEl = document.createElement('body')
      bodyEl.textContent = raw
      return bodyEl
    }
    const parser = new DOMParser()
    const doc = parser.parseFromString(raw, 'text/html')
    return doc.body || document.createElement('body')
  }

  function removeScripts(root) {
    root.querySelectorAll('script').forEach((s) => s.remove())
  }

  function isPossiblyDangerous(name, value) {
    const val = String(value || '')
      .replace(/\s+/g, '')
      .toLowerCase()
    if (['src', 'href', 'xlink:href'].includes(name)) {
      if (/^(?:javascript|vbscript|data):/i.test(val)) return true
    }
    if (name && name.toLowerCase().startsWith('on')) return true
    return false
  }

  function stripAllAttributes(elem) {
    Array.from(elem.attributes).forEach(({ name }) => elem.removeAttribute(name))
  }

  function removeDangerousAttributes(elem) {
    Array.from(elem.attributes).forEach(({ name, value }) => {
      if (isPossiblyDangerous(name, value)) elem.removeAttribute(name)
    })
  }

  function sanitiseNode(node) {
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
          // Strip all attributes for safety
          stripAllAttributes(node)
        }
      } else {
        removeDangerousAttributes(node)
      }
    }

    Array.from((node.childNodes || [])).forEach((child) => sanitiseNode(child))
  }

  const body = stringToHTML()
  removeScripts(body)
  Array.from(body.childNodes).forEach((n) => sanitiseNode(n))

  if (nodes) {
    const frag = document.createDocumentFragment()
    while (body.firstChild) frag.appendChild(body.firstChild)
    return frag
  }

  return body.innerHTML
}

// Strict version: defaults to safe inline/text tags
export function cleanHTMLStrict(str, nodes, opts = {}) {
  const strictOpts = {
    ...opts,
    allowedTags: opts.allowedTags || ['p', 'span', 'strong', 'em', 'br', 'kbd', 'code'],
  }
  return baseCleanHTML(str, nodes, strictOpts)
}

// Open version: current behaviour (no default allowlist)
export function cleanHTMLOpen(str, nodes, opts = {}) {
  return baseCleanHTML(str, nodes, opts)
}

export default cleanHTMLOpen
