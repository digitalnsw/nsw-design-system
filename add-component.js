const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const componentName = args[0]
const fileTypes = [`_${componentName}.scss`, `_${componentName}.hbs`, 'index.hbs', `${componentName}.js`, `${componentName}.json`]
const currentDir = path.resolve(process.cwd())
const dir = `${currentDir}/src/components/${componentName}`

const createFile = (filePath) => {
  fileTypes.forEach((element) => {
    fs.writeFileSync(`${filePath}/${element}`, '')
  })
}

const createDir = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdir(filePath, (err) => {
      if (err) {
        console.log('sean', err.message)
      } else {
        console.log(`${filePath} created!`)
        createFile(filePath)
      }
    })
  } else {
    createFile(filePath)
  }
}

createDir(dir)
