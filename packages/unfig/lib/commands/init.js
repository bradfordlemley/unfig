//@flow
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { genFromFile, templateDir } = require('../templates');
const { writeConfig, getUnfig } = require('../toolkit');

/*::

import type {InternalCmd, InternalCmdArgs} from '../types';

type InitFlags = {
  force: ?boolean,
  prompt: ?boolean,
  unfigModule: ?string,
  toolkit: ?string,
}
*/

const defaultTemplateVars = {
  unfigModule: 'unfig',
};

const defaultTemplateFile = path.join(templateDir, 'cfgfile-template.js');

function removeVersion(pkg) {
  const idx = pkg.lastIndexOf('@');
  if (idx <= 0) {
    return pkg;
  }
  return pkg.slice(0, idx);
}

function isPath(pkg) {
  return path.isAbsolute(pkg) || pkg.startsWith('.');
}

async function createConfigFile(
  targetFile,
  opts,
  templateFileOverride,
  templateVarOverrides
) {
  const templateFile = templateFileOverride || defaultTemplateFile;
  const templateVars = {
    ...defaultTemplateVars,
    ...(opts.unfigModule ? { unfigModule: opts.unfigModule } : {}),
    ...templateVarOverrides,
  };
  templateVars.unfigModule = templateVars.unfigModule.replace(/\\/g, '\\\\');
  const content = genFromFile(templateFile, templateVars);
  let create = true;
  if (fs.existsSync(targetFile)) {
    if (!fs.readFileSync(targetFile).equals(Buffer.from(content, 'utf-8'))) {
      if (opts.force) {
        console.error(
          chalk.red(
            `Overwriting target file ${targetFile} (due to --force option).`
          )
        );
      } else {
        console.warn(
          chalk.yellow(`Target file ${targetFile} is different than template.`)
        );
        if (!opts.prompt) {
          create = false;
        } else {
          create = await inquirer
            .prompt({
              type: 'confirm',
              message: `Overwrite ${targetFile}?`,
              name: 'overwrite',
              default: false,
            })
            .then(answers => answers.overwrite);
          create = Boolean(create);
          if (create) {
            console.log(
              chalk.red(
                `Overwriting target file ${targetFile} (due to user choice).`
              )
            );
          }
        }
      }
    } else {
      console.log(chalk.green(`Target file ${targetFile} matches template.`));
      create = false;
    }
  } else {
    console.log(chalk.blue(`Creating file ${targetFile} in target package.`));
  }

  if (create) {
    fs.writeFileSync(targetFile, content);
  }
}

const init = (async function init({ env, argv }) {
  const targetDir = env.rootDir;
  if (!fs.existsSync(path.join(targetDir, 'package.json'))) {
    throw new Error(`package.json missing in ${targetDir}`);
  }
  const targetFile = path.join(targetDir, env.cfgFilename);
  console.log(chalk.green(`Initializing at ${targetDir}.`));
  let toolkit = undefined;
  if (!fs.existsSync(targetFile)) {
    if (argv.toolkit) {
      toolkit = argv.toolkit;
    } else {
      toolkit = await inquirer
        .prompt([
          {
            message: `Enter toolkit:`,
            name: 'toolkit',
            type: 'input',
          },
        ])
        .then(results => results.toolkit);
    }

    if (toolkit == null || typeof toolkit !== 'string') {
      throw new Error(`Unexpected toolkit type`);
    }
    if (!isPath(toolkit)) {
      await env.run('yarn', ['add', toolkit, '--dev']);
    }
    writeConfig(targetFile, {
      toolkit: removeVersion(toolkit).replace(/\\/g, '\\\\'),
    });
  }

  const { unfig } = getUnfig(targetDir);

  if (unfig && unfig.modules) {
    Object.keys(unfig.modules).forEach(file => {
      if (unfig.modules && unfig.modules[file]) {
        createConfigFile(path.join(targetDir, file), argv);
      }
    });
  }
  return { code: 0 };
} /*: InternalCmd<InitFlags> */);

module.exports = {
  commands: {
    init: {
      command: 'init [--force]',
      describe: 'Initialize project',
      builder:
        // $ExpectError: missing type annotation
        yargs =>
          yargs
            .option('toolkit', {
              describe: 'Type of project to create',
              requiresArg: true,
              type: 'string',
            })
            .option('force', {
              default: false,
              describe: 'Force files to be overwritten',
              type: 'boolean',
            })
            .option('no-prompt', {
              default: false,
              describe: 'Disable interactive prompts (e.g. for ci)',
              type: 'boolean',
            })
            .option('unfig-module', {
              describe: 'module name to use in require("xx") in config files',
              hidden: true,
              type: 'string',
            })
            .group(['type', 'force', 'no-prompt', 'help'], 'Command Options:')
            .version(false)
            .help(),
      handler: init,
    },
  },
};
