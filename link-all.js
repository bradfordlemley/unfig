#!/usr/bin/env node
const execa = require("execa");

execa('lerna', ['list'], {cwd: __dirname})
.then(r => {
  let promise = Promise.resolve();
  const unlink = process.argv.includes('--unlink')
  r.stdout.split("\n").forEach(pkg => promise = promise.then(() => execa('yarn', [unlink?'unlink':'link', pkg], {stdio: 'inherit'})))
  return promise;
})