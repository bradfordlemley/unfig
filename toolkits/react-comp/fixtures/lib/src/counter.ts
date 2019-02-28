export default class Counter {
  counter: number;
  constructor() {
    this.counter = 0;
  }
  increment(inc: number = 1) {
    this.counter += inc;
  }
  decrement(dec: number = 1) {
    this.counter -= dec;
  }
  double() {
    this.counter = this.counter * 2;
  }
}
