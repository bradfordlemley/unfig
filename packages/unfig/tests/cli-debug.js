//@flow
const chalk = require('chalk');
const inquirer = require('inquirer');
const cmd = require('../lib/cmd');

async function main() {
  const command = await inquirer
    .prompt([
      {
        message: `Script args:`,
        name: 'command',
        type: 'input',
      },
    ])
    .then(results => results.command);

  const args = typeof command === 'string' ? command.split(' ') : [];
  return cmd(args).catch(err => {
    console.error(chalk.red('\n\nError: ', err, '\n\n'));
    throw err;
  });
}

main();
