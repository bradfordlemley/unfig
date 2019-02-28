import React from 'react';
import PropTypes from 'prop-types';

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

class TestComponent extends React.Component {
  render() {
    const _this$props = this.props,
      { a } = _this$props,
      other = _objectWithoutProperties(_this$props, ['a']);

    return React.createElement('div', null, 'HI', a, other.b && other.b);
  }
}

async function wait(ms = 500) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}
TestComponent.propTypes = {
  a: PropTypes.string,
};

export default TestComponent;
export { wait };
//# sourceMappingURL=index.js.map
