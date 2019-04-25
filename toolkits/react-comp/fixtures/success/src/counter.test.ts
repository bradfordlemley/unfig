import Counter from './counter';

test('Increments', () => {
  const counter = new Counter();
  expect(counter.counter).toEqual(0);
  counter.increment();
  expect(counter.counter).toEqual(1);
  counter.increment(2);
  expect(counter.counter).toEqual(3);
});

test('Decrements', () => {
  const counter = new Counter();
  expect(counter.counter).toEqual(0);
  counter.decrement();
  expect(counter.counter).toEqual(-1);
});
