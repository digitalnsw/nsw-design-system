function leadingWhitespace(line) {
  return line.match(/^[\t ]*/)[0]
}

module.exports = function formatCode(options) {
  const lines = options.fn(this).split('\n')

  while (lines.length && !lines[0].trim()) lines.shift()
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop()

  if (!lines.length) return ''

  const indents = lines
    .filter((line) => line.trim())
    .map((line) => leadingWhitespace(line))
  const commonIndent = indents.reduce((common, indent) => {
    let length = 0
    const maxLength = Math.min(common.length, indent.length)

    while (length < maxLength && common[length] === indent[length]) length += 1

    return common.slice(0, length)
  })
  const code = lines
    .map((line) => (line.startsWith(commonIndent) ? line.slice(commonIndent.length) : line))
    .join('\n')

  return code
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/</g, '\\x3C')
    .replace(/\n/g, '\\n')
}
