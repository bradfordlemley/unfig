#!/usr/bin/env node
//@flow
const mod = require('./');

async function run(args) {
  return mod
    .execCmd(args)
    .then(result => {
      if (result && result.msg) {
        console.log(result.msg);
      }
      const code = result && result.code != null ? result.code : 0;
      // eslint-disable-next-line no-process-exit
      process.exit(code);
    })
    .catch((err /* :{code?: number, message?: string, stack?: string} */) => {
      const msg = err
        ? err.stack
          ? err.stack
          : err.message
          ? `Error: ${err.message}`
          : err
        : err;
      // $ ExpectError: coerce msg
      console.error(msg);
      // err && err.stack && console.error(`${err.stack}`);
      // eslint-disable-next-line no-process-exit
      process.exit((err && err.code) || 2);
    });
}

run(process.argv.slice(2));
