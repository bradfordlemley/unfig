#!/usr/bin/env node
const execa = require("execa");

execa('lerna', ['list'], {cwd: __dirname})
.then(r => {
  let promise = Promise.resolve();
  r.stdout.split("\n").forEach(pkg => promise = promise.then(() => execa('yarn', ['link', pkg], {stdio: 'inherit'})))
  return promise;
})