function readuntil(stream, predicate, timeoutMs = 5000) {
  return new Promise(resolve => {
    let output = null;
    let timeout = setTimeout(finish, timeoutMs);
    stream.setEncoding('utf-8');
    function finish() {
      stream.removeListener('data', onData);
      clearTimeout(timeout);
      resolve(output);
    }
    function onData(chunk) {
      const data = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      output = output ? output.concat(data) : data;
      if (
        (predicate.test && predicate.test(output)) ||
        (typeof predicate === 'string' && output.indexOf(predicate) != -1) ||
        (typeof predicate === 'function' && predicate(output))
      ) {
        finish();
      }
    }
    stream.on('data', onData);
  });
}

module.exports = readuntil;
