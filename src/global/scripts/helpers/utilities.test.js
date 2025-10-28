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
  .concat('\nmodule.exports = { getFocusableElement, focusObjectGenerator };')

const sandbox = { module: { exports: {} } }
vm.runInNewContext(code, sandbox)
const { getFocusableElement } = sandbox.module.exports

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

console.log('Focus handling test passed')
