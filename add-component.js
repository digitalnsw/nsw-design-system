const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')

const askQuestions = () => {
  const questions = [
    {
      type: 'list',
      name: 'FOLDERTYPE',
      message: 'What are we creating?',
      choices: ['component', 'pattern', 'style', 'page'],
    },
    {
      name: 'FOLDERNAME',
      type: 'input',
      message: 'What is the name of the component/pattern/style/page?',
    },
  ]
  return inquirer.prompt(questions)
}

const createFile = (filePath, name) => {
  const fileTypes = [`_${name}.scss`, `_${name}.hbs`, 'index.hbs', `${name}.js`, `${name}.json`]
  fileTypes.forEach((element) => {
    fs.writeFileSync(`${filePath}/${element}`, '')
  })
}

const createDir = (type, name) => {
  const currentDir = path.resolve(process.cwd())
  const filePath = `${currentDir}/src/${type}s/${name}`

  if (!fs.existsSync(filePath)) {
    fs.mkdir(filePath, (err) => {
      if (err) {
        console.log(err.message)
      } else {
        console.log(`${filePath} created!`)
        createFile(filePath, name)
      }
    })
  } else {
    createFile(filePath, name)
  }
}

const run = async () => {
  const answers = await askQuestions()
  const { FOLDERTYPE, FOLDERNAME } = answers

  createDir(FOLDERTYPE, FOLDERNAME)
}

run()
