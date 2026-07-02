const fs = require('fs')
const path = require('path')
const vm = require('vm')
const assert = require('assert')

const filePath = path.resolve(__dirname, 'utilities.js')
let code = fs.readFileSync(filePath, 'utf8')

// Remove import lines and convert ES module syntax to CommonJS
code = code
  .replace(/\s*import[^\n]*\n/, '')
  .replace(/export const /g, 'const ')
  .concat('\nmodule.exports = { getFocusableElement, focusObjectGenerator, copyToClipboard };')

let appendedElement = null
const activeElement = {
  focusOptions: null,
  focus(options) {
    this.focusOptions = options
  },
}
const body = {
  appendChild(element) {
    assert.strictEqual(element.value, '')
    appendedElement = element
  },
  removeChild(element) {
    assert.strictEqual(element, appendedElement)
    appendedElement = null
  },
}
const document = {
  activeElement,
  body,
  documentElement: body,
  createElement: () => ({
    style: {},
    value: '',
    setAttribute(name, value) {
      this[name] = value
    },
    select() {
      this.selected = true
    },
    setSelectionRange(start, end) {
      this.selectionRange = [start, end]
    },
  }),
  execCommand(command) {
    assert.strictEqual(command, 'copy')
    assert.strictEqual(appendedElement.value, 'https://example.test/page')
    assert.strictEqual(appendedElement.selected, true)
    assert.deepStrictEqual(appendedElement.selectionRange, [0, appendedElement.value.length])
    return true
  },
}

const sandbox = {
  document,
  window: {
    isSecureContext: false,
    navigator: {},
  },
  module: { exports: {} },
}
vm.runInNewContext(code, sandbox)
const { copyToClipboard, getFocusableElement } = sandbox.module.exports

class NodeListLike {
  constructor(items) {
    this.length = items.length
    items.forEach((item, i) => { this[i] = item })
  }
}

const link = { id: 'link' }
const drag = { id: 'drag', className: 'is-draggable' }
const box = { id: 'box' }

const fakeEl = {
  querySelectorAll: (selector) => {
    const items = selector.includes('.is-draggable') ? [link, box] : [link, drag, box]
    return new NodeListLike(items)
  },
}

const result = getFocusableElement(fakeEl)

assert.strictEqual(result.length, 2)
assert.ok(result.all.every((el) => el.id !== 'drag'))
copyToClipboard('https://example.test/page').then((copied) => {
  assert.strictEqual(copied, true)
  assert.strictEqual(appendedElement, null)
  assert.strictEqual(activeElement.focusOptions.preventScroll, true)

  console.log('Focus handling test passed')
  console.log('Clipboard fallback test passed')
})
