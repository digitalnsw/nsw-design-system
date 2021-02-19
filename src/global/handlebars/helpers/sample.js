module.exports = function (partial) {
  const pretag = new RegExp('<!--sample(.|\\n)*?endsample-->')
  let match = ''
  if (pretag.test(partial)) {
    match = pretag.exec(partial)[0].replace('<!--sample', '')
      .replace('endsample-->', '')
  }
  return match
}
