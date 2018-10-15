const chalk = require('chalk')
exports.log = {
  info: message => {
    console.log(message)
  },
  notice: message => {
    console.log(chalk.green(message))
  },
  error: message => {
    console.log(chalk.red(message))
  },
  warn: message => {
    console.log(chalk.yellow(message))
  },
}