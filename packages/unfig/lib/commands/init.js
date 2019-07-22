//@flow
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { genFromFile, templateDir } = require('../templates');
const { writeConfig, loadToolkit } = require('../toolkit');

/*::

import type {InternalCmd, InternalCmdArgs} from '../types';

type InitFlags = {
  force: ?boolean,
  prompt: ?boolean,
  unfigModule: ?string,
  toolkit: ?string,
}

type InitFileFlags = InitFlags & {
  file: string,
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

async function createConfigModule(
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
const toJson = obj => JSON.stringify(obj, null, 2);

async function createJsonFile(targetFile, json, opts) {
  let create = true;
  const content = toJson(json);
  if (fs.existsSync(targetFile)) {
    const existing = fs.readFileSync(targetFile);
    if (content !== existing) {
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
      console.log(chalk.green(`Target file ${targetFile} matches.`));
      create = false;
    }
  } else {
    console.log(chalk.blue(`Creating file ${targetFile} in target package.`));
  }

  if (create) {
    fs.writeFileSync(targetFile, content);
  }
}

const init = (async function init({ env, argv, args }) {
  const targetDir = env.rootDir;
  if (!fs.existsSync(path.join(targetDir, 'package.json'))) {
    throw new Error(`package.json missing in ${targetDir}`);
  }
  const targetFile = path.join(targetDir, env.cfgFilename);
  console.log(chalk.green(`Creating at ${targetDir}.`));
  let toolkit = undefined;
  const noInstall = args.includes('--no-install');
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
      await env.installDevDeps([toolkit]);
    }
    writeConfig(targetFile, {
      toolkit: removeVersion(toolkit).replace(/\\/g, '\\\\'),
    });
  }

  const unfig = loadToolkit(targetDir);

  if (unfig && unfig.modules) {
    let promise = Promise.resolve();
    Object.keys(unfig.modules).forEach(file => {
      if (unfig.modules && unfig.modules[file]) {
        promise = promise.then(() =>
          createConfigModule(path.join(targetDir, file), argv)
        );
      }
    });
    await promise;
  }

  if (unfig && unfig.jsonFiles) {
    let promise = Promise.resolve();
    Object.keys(unfig.jsonFiles).forEach(file => {
      if (unfig.jsonFiles && unfig.jsonFiles[file]) {
        promise = promise.then(() =>
          createJsonFile(
            path.join(targetDir, file),
            unfig.jsonFiles[file].handler(),
            argv
          )
        );
      }
    });
    await promise;
  }

  if (!noInstall && unfig && unfig.toolDependencies) {
    const deps = Object.keys(unfig.toolDependencies).map(dep => {
      const version = unfig.toolDependencies[dep].version;
      return `${dep}${version ? `@${version}` : ''}`;
    });
    if (deps.length) {
      await env.installDevDeps(deps);
    }
  }

  return { code: 0 };
} /*: InternalCmd<InitFlags> */);

const initFile = (async function initFile({ env, argv }) {
  const targetDir = env.rootDir;
  console.log('make file: ', targetDir);
  console.log('make file argv: ', argv);
  const unfig = loadToolkit(targetDir);

  if (unfig && unfig.modules) {
    let promise = Promise.resolve();
    Object.keys(unfig.modules).forEach(file => {
      if (argv.file === file && unfig.modules && unfig.modules[file]) {
        promise = promise.then(() =>
          createConfigModule(path.join(targetDir, file), argv)
        );
      }
    });
    await promise;
  }

  if (unfig && unfig.jsonFiles) {
    let promise = Promise.resolve();
    Object.keys(unfig.jsonFiles).forEach(file => {
      if (argv.file === file && unfig.jsonFiles && unfig.jsonFiles[file]) {
        promise = promise.then(() =>
          createJsonFile(
            path.join(targetDir, file),
            unfig.jsonFiles[file].handler(),
            argv
          )
        );
      }
    });
    await promise;
  }

  return { code: 0 };
} /*: InternalCmd<InitFileFlags> */);

module.exports = {
  commands: {
    initFile: {
      describe: 'Initialize project',
      // $ExpectError: missing type annotation
      builder: yargs =>
        yargs.option('file', {
          describe: 'Type of project to create',
          requiresArg: true,
          type: 'string',
        }),
      handler: initFile,
    },
    init: {
      // command: 'init [--force]',
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
            // .group(['type', 'force', 'no-prompt', 'help'], 'Command Options:')
            // .group('Command Options:')
            .version(false)
            .help(),
      handler: init,
    },
  },
};
