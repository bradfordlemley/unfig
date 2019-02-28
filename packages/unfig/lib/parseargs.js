// @flow
// $ExpectError: untyped module
const yargsParser = require('yargs-parser');

const GLOBAL_FLAGS = [
  '--help',
  '--rebug',
  '--rebug-brk',
  '--inspect',
  '--inspect-brk',
];
const GLOBAL_OPTS = ['--rootDir'];

const emptyCmd = () => ({
  cmd: '',
  cmdArgs: {
    args: [],
    raw: [],
    parseable: [],
    passthru: [],
  },
  globalArgs: {
    raw: [],
    argv: {
      rootDir: '',
      help: false,
    },
  },
});

/*::
type Result = {|
  cmd: string,
  cmdArgs: {|
    args: $ReadOnlyArray<string>,
    raw: $ReadOnlyArray<string>,
    parseable: $ReadOnlyArray<string>,
    passthru: $ReadOnlyArray<string>,
  |},
  globalArgs: {|
    raw: $ReadOnlyArray<string>,
    argv: {|
      rootDir?: string,
      help?: boolean,
    |},
  |},
  rebug?: {|
    nodeArgs: $ReadOnlyArray<string>,
    scriptArgs: $ReadOnlyArray<string>,
  |}
|}
*/

module.exports = (args /* :$ReadOnlyArray<string> */) /* :Result */ => {
  let cmdIndex = -1;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('-')) {
      if (GLOBAL_OPTS.includes(arg)) {
        i++;
      } else if (!GLOBAL_FLAGS.includes(arg)) {
        throw new Error(`Unrecognized global arg: ${arg}`);
      }
    } else {
      cmdIndex = i;
      break;
    }
  }

  const gArgs =
    cmdIndex < 0 ? args : cmdIndex === 0 ? [] : args.slice(0, cmdIndex);

  const REBUG_FLAGS = ['--rebug', '--rebug-brk'];
  const rebugArgs = gArgs.filter(arg => REBUG_FLAGS.includes(arg));
  if (rebugArgs.length) {
    return {
      ...emptyCmd(),
      rebug: {
        nodeArgs: rebugArgs.includes('--rebug-brk')
          ? ['--inspect-brk=2333']
          : ['--inspect=2333'],
        scriptArgs: args.filter(arg => !REBUG_FLAGS.includes(arg)),
      },
    };
  }

  const gArgv = yargsParser(gArgs, {
    configuration: {
      'halt-at-non-option': true,
    },
    boolean: ['--inspect', '--inspect-dbg'],
  });

  delete gArgv['_'];

  const globalArgs = {
    raw: gArgs,
    argv: gArgv,
  };

  if (gArgs.includes('--help')) {
    return {
      ...emptyCmd(),
      cmd: '--help',
      globalArgs,
    };
  }

  if (cmdIndex === -1) {
    return {
      ...emptyCmd(),
      globalArgs,
    };
  }

  const cmd = args[cmdIndex];
  const allCmdArgs = args.slice(cmdIndex + 1);
  const passThruArgIndex = allCmdArgs.findIndex(arg => arg === '--');
  const parseableCmdArgs =
    passThruArgIndex === -1
      ? allCmdArgs
      : allCmdArgs.slice(0, passThruArgIndex);
  const passthruCmdArgs =
    passThruArgIndex === -1 ? [] : allCmdArgs.slice(passThruArgIndex + 1);

  return {
    cmd,
    cmdArgs: {
      args: parseableCmdArgs.concat(passthruCmdArgs),
      raw: allCmdArgs,
      parseable: parseableCmdArgs,
      passthru: passthruCmdArgs,
    },
    globalArgs,
  };
};
