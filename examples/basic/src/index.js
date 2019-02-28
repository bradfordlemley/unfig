export default class Counter {
  constructor() {
    this.counter = 0;
  }
  increment() {
    this.counter++;
  }
  decrement() {
    this.counter--;
  }
  double() {
    this.counter = this.counter * 2;
  }
}
