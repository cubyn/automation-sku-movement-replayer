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

module.exports = { getInput, getInputYesOrNo, logInfo };
