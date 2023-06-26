const chalk = require('chalk');
const readline = require('node:readline/promises').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getInput = async (question) => {
  return await readline.question(chalk.bold.blue(`${question}\n`));
};
const getInputYesOrNo = async (question) => {
  const result = await readline.question(chalk.blue.bold(`${question} (yes/no)\n`));
  return result === 'yes' ? true : false;
};

const logInfo = (message) => {
  console.log(chalk.bold.yellow(message));
};

const logDivider = (text, divider) => {
  const textToDisplay = divider.repeat(30) + text + divider.repeat(30);
  console.log(chalk.bold.red(textToDisplay));
};
const logBgRed = (message) => {
  console.log(chalk.bold.bgRed(message));
};
const logBgGreen = (message) => {
  console.log(chalk.bold.bgGreen(message));
};

module.exports = {
  getInput,
  getInputYesOrNo,
  logInfo,
  logDivider,
  logBgRed,
  logBgGreen,
};
