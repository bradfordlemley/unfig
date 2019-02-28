//@flow

const execa = require('execa');
// $ExpectError: untyped module
const yargs = require('yargs/yargs');
const parseargs = require('./parseargs');
const { getUnfig } = require('./toolkit');

/*::
import type {CommonModuleObject} from 'yargs';
import type {InternalCmd, InternalCmdArgs, InternalCmdEntry} from './types';
*/

module.exports = (
  args /* : $ReadOnlyArray<string> */
) /*: Promise<?{code?: number, msg?: string}>*/ =>
  new Promise((resolve, reject) => {
    if (!Array.isArray(args)) {
      throw new Error(`Args must be array`);
    }

    let handled = false;

    const { cmd, cmdArgs, rebug, globalArgs } = parseargs(args);

    const { argv: gArgv, raw: gArgs } = globalArgs;

    const parseableArgs = [cmd].concat(cmdArgs.parseable);

    const { env, unfig } = getUnfig(gArgv.rootDir || process.cwd(), gArgs);

    if (rebug) {
      resolve(
        execa(
          'node',
          rebug.nodeArgs
            .concat([require.resolve('./cli')])
            .concat(rebug.scriptArgs),
          {
            stdio: 'inherit',
          }
        )
      );
      return;
    }

    if (cmd == '') {
      throw new Error(`No command found in ${args.join(' ')}`);
    }

    const wrapCmd = (name, command) => ({
      ...command,
      handler: cmdFlags => {
        handled = true;
        command.handler &&
          resolve(
            command.handler({
              args: cmdArgs.args,
              argv: cmdFlags,
              env,
            })
          );
      },
      command: command.command || name,
    });

    const wrapPluginCmd = (name, command) => {
      return {
        ...command,
        handler: () => {
          handled = true;
          resolve(Promise.resolve(command.exec(cmdArgs.args)));
        },
        command: name,
      };
    };

    let yCmd = yargs()
      .usage('Usage: unfig <command> [options]')
      .option('rootDir', {
        describe: 'Where to start looking for project package, default: cwd',
        requiresArg: true,
        type: 'string',
      })
      .option('rebug', {
        describe: 'Relaunch script with node --inspect',
        type: 'boolean',
      })
      .option('rebug-brk', {
        describe: 'Relaunch script with node --inspect-brk',
        type: 'boolean',
      })
      .option('inspect', {
        describe: 'Spawn children with node --inspect',
        type: 'boolean',
      })
      .option('inspect-brk', {
        conflicts: 'inspect',
        describe: 'Spawn children with node --inspect-brk',
        type: 'boolean',
      })
      .group(['rootDir'], 'Global Options:')
      .group(
        ['inspect', 'inspect-brk', 'rebug', 'rebug-brk'],
        'Global Debug Options:'
      );

    const internals /*: Array< {commands:  { [string]: InternalCmdEntry } } >*/ = [
      require('./commands/init'),
      require('./commands/create'),
    ];
    const INTERNAL_COMMANDS = [];
    internals.forEach(internal => {
      const { commands } = internal;
      commands &&
        Object.keys(commands).forEach(cmd => {
          INTERNAL_COMMANDS.push(cmd);
          if (commands[cmd] && commands[cmd].handler) {
            yCmd.command(wrapCmd(cmd, commands[cmd]));
          }
        });
    });

    if (!INTERNAL_COMMANDS.includes(cmd)) {
      let commandFound = false;
      if (unfig != null) {
        const { commands } = unfig;
        Object.keys(commands).forEach(key => {
          yCmd.command(wrapPluginCmd(key, commands[key]));
          if (key === cmd) {
            commandFound = true;
          }
        });
      }

      if (!gArgv.help && cmd != 'help' && !commandFound) {
        throw new Error(
          `Command "${cmd}" is not available, use --help for usage`
        );
      }
    }

    yCmd
      .demandCommand(1, 'A command is required.')
      .exitProcess(false)
      .help()
      .version(false)
      .wrap(Math.min(yCmd.terminalWidth(), 90))
      .parse(parseableArgs, (err, argv, output) => {
        if (err) {
          reject(new Error(`CmdParse: Failed to parse cmd: ${output}`));
        } else if (argv.help) {
          handled = true;
          resolve({ code: 0, msg: output });
        }
      });

    if (!handled) {
      throw new Error(
        `No command given in ${JSON.stringify(
          args.join(' ')
        )}. Use help command for usage`
      );
    }
  });
