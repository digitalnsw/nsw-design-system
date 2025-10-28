/* eslint-disable no-console */
const log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args)
  }
}

export default { log }
