// @flow
const chalk = require('chalk');
const execa = require('execa');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const path = require('path');
// $ExpectError: no def
const validateProjectName = require('validate-npm-package-name');

/*::

import type {InternalCmd, InternalCmdArgs} from '../types';

type CreateFlags = {
  force: ?boolean,
  prompt: ?boolean,
  frameworkPkg: ?string,
  toolkit: ?string,
  _: Array<string>,
}
*/

async function createPkg(
  dir /*: string */,
  frameworkPkg /*: ?string */,
  initArgs /*: $ReadOnlyArray<string> */
) {
  console.log(chalk.green(`Initializing at ${dir}.`));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeJsonSync(path.join(dir, 'package.json'), {
    name: path.basename(dir),
  });
  execa.sync('yarn', ['init', '--yes'], { cwd: dir, stdio: 'inherit' });
  execa.sync('yarn', ['add', `${frameworkPkg || 'unfig'}`], {
    cwd: dir,
    stdio: 'inherit',
  });
  execa.sync('yarn', ['unfig', 'init'].concat(initArgs), {
    cwd: dir,
    stdio: 'inherit',
  });
}

const create = (async function create({ argv, args }) {
  let dir = argv._[1];
  if (dir) {
    if (fs.existsSync(dir)) {
      const contents = fs.readdirSync(dir);
      if (contents.length) {
        console.error(
          chalk.red(
            `${dir} already exists, you can not create in existing dir.`
          )
        );
        dir = null;
      }
    }
  }
  if (!dir) {
    dir = await inquirer
      .prompt([
        {
          message: `Enter project dir to create`,
          name: 'dir',
          type: 'input',
          validate: entered => {
            if (typeof entered != 'string') {
              throw new Error(`entered must be string`);
            }
            if (fs.existsSync(entered)) {
              return `"${entered}" already exists at ${path.dirname(
                path.resolve(entered)
              )}, please enter a path that does not already exist.`;
            }
            const valid = validateProjectName(entered);
            if (!valid.validForNewPackages) {
              return valid.errors[0];
            }
            return true;
          },
        },
      ])
      .then(results => (typeof results.dir === 'string' ? results.dir : ''));
  }

  if (dir) {
    await createPkg(
      dir,
      argv.frameworkPkg,
      args.filter(arg => arg !== argv._[1])
    );
  }

  return {};
} /*: InternalCmd<CreateFlags> */);

module.exports = {
  commands: {
    create: {
      describe: 'Create project',
      builder: {
        frameworkPkg: {
          default: 'unfig',
          describe: '',
          hidden: true,
          type: 'string',
        },
        toolkit: {
          describe: 'Type of project to create',
          requiresArg: true,
          type: 'string',
        },
      },
      handler: create,
    },
  },
};
