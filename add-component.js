/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args)
  }
}

const ask = (rl, question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(String(answer).trim()))
})

const askList = async (rl, question, choices) => {
  const prompt = `${question} (${choices.join('/')}), default ${choices[0]}: `
  while (true) {
    const answer = await ask(rl, prompt)
    if (!answer) {
      return choices[0]
    }
    const match = choices.find((choice) => choice.toLowerCase() === answer.toLowerCase())
    if (match) {
      return match
    }
    log(`Please enter one of: ${choices.join(', ')}`)
  }
}

const askText = async (rl, question) => {
  while (true) {
    const answer = await ask(rl, question)
    if (answer) {
      return answer
    }
    log('Please enter a value.')
  }
}

const createFile = (filePath, name) => {
  const fileTypes = [`_${name}.scss`, `_${name}.hbs`, 'index.hbs', `${name}.js`, `${name}.json`]
  fileTypes.forEach((element) => {
    fs.writeFileSync(`${filePath}/${element}`, '')
  })
}

const createDir = (type, name) => {
  const currentDir = path.resolve(process.cwd())
  const filePath = path.join(currentDir, 'src', `${type}s`, name)

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true })
    log(`${filePath} created!`)
  }
  createFile(filePath, name)
}

const run = async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const folderType = await askList(rl, 'What are we creating?', ['component', 'pattern', 'style', 'page'])
    const folderName = await askText(rl, 'What is the name of the component/pattern/style/page? ')
    createDir(folderType, folderName)
  } finally {
    rl.close()
  }
}

run()
