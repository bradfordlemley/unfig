import React from 'react';
import { cleanup, render } from 'react-testing-library';
import TestComp from './';

afterEach(cleanup);

test('Renders', async () => {
  const { getByText } = render(<TestComp a="a" />);
  getByText('HIa');
});
