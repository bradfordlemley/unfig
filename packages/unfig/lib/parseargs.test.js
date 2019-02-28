// @flow
const parse = require('./parseargs');

test('parses command only', () => {
  expect(parse(['test'])).toEqual({
    cmdArgs: {
      args: [],
      raw: [],
      parseable: [],
      passthru: [],
    },
    cmd: 'test',
    globalArgs: {
      raw: [],
      argv: {},
    },
  });
});

test('parses command with arg', () => {
  expect(parse(['test', 'arg', 'arg2'])).toEqual({
    cmdArgs: {
      args: ['arg', 'arg2'],
      raw: ['arg', 'arg2'],
      parseable: ['arg', 'arg2'],
      passthru: [],
    },
    cmd: 'test',
    globalArgs: {
      raw: [],
      argv: {},
    },
  });
});

test('parses command with passthru args', () => {
  expect(parse(['test', '--', 'arg', 'arg2'])).toEqual({
    cmdArgs: {
      args: ['arg', 'arg2'],
      raw: ['--', 'arg', 'arg2'],
      parseable: [],
      passthru: ['arg', 'arg2'],
    },
    cmd: 'test',
    globalArgs: {
      raw: [],
      argv: {},
    },
  });
});

test('parses command with args and passthru args', () => {
  expect(parse(['test', 'arg', 'arg2', '--', 'arg3', 'arg4'])).toEqual({
    cmdArgs: {
      args: ['arg', 'arg2', 'arg3', 'arg4'],
      raw: ['arg', 'arg2', '--', 'arg3', 'arg4'],
      parseable: ['arg', 'arg2'],
      passthru: ['arg3', 'arg4'],
    },
    cmd: 'test',
    globalArgs: {
      raw: [],
      argv: {},
    },
  });
});

test('parses global --help', () => {
  expect(parse(['--help', 'test', '--', 'arg', 'arg2'])).toEqual({
    cmdArgs: {
      args: [],
      raw: [],
      parseable: [],
      passthru: [],
    },
    cmd: '--help',
    globalArgs: {
      raw: ['--help'],
      argv: { help: true },
    },
  });
});

test('parses command with args and passthru args', () => {
  expect(parse(['--rebug-brk', 'test:debug', '--', 'help'])).toEqual({
    rebug: {
      nodeArgs: ['--inspect-brk=2333'],
      scriptArgs: ['test:debug', '--', 'help'],
    },
    cmdArgs: {
      args: [],
      raw: [],
      parseable: [],
      passthru: [],
    },
    cmd: '',
    globalArgs: {
      raw: [],
      argv: {
        help: false,
        rootDir: '',
      },
    },
  });
});

test('parses --rebug-brk help', () => {
  expect(parse(['--rebug-brk', 'help'])).toEqual({
    rebug: {
      nodeArgs: ['--inspect-brk=2333'],
      scriptArgs: ['help'],
    },
    cmdArgs: {
      args: [],
      raw: [],
      parseable: [],
      passthru: [],
    },
    cmd: '',
    globalArgs: {
      raw: [],
      argv: {
        help: false,
        rootDir: '',
      },
    },
  });
});
