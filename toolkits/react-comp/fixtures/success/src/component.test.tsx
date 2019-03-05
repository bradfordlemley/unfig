import React from 'react';
import { cleanup, render } from 'react-testing-library';
import TestComp from './component';

afterEach(cleanup);

test('Renders', async () => {
  const { getByText } = render(<TestComp a="a" b={12} />);
  getByText('HIa');
});
