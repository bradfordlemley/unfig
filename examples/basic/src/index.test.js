import Counter from "./";

test("Increments", () => {
  const counter = new Counter();
  expect(counter.counter).toEqual(0);
  counter.increment();
  expect(counter.counter).toEqual(1);
});

test("Decrements", () => {
  const counter = new Counter();
  expect(counter.counter).toEqual(0);
  counter.decrement();
  expect(counter.counter).toEqual(-1);
});
