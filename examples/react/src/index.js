import React from 'react';
import PropTypes from 'prop-types';

export default class TestComponent extends React.Component {
  render() {
    const { a, ...other } = this.props;
    return (
      <div>
        HI{a}
        {other.b && other.b}
      </div>
    );
  }
}

async function wait(ms = 500) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

export { wait };

TestComponent.propTypes = {
  a: PropTypes.string,
};
