function debug(optionalValue) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Current Context')
    console.log('====================')
    console.log(this)
    if (optionalValue) {
      console.log('Value')
      console.log('====================')
      console.log(optionalValue)
    }
  }
}

module.exports = debug
