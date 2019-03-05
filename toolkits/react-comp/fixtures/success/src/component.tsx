import * as React from 'react';

interface Props {
  a: string;
  b: number;
}

export default class TestComponent extends React.Component<Props> {
  render() {
    const { a } = this.props;
    return <div>HI{a}</div>;
  }
}
