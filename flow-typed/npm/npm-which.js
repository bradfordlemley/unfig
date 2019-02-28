import { string } from "prop-types";

declare module 'npm-which' {

  declare interface Callback {
    (err: number, path: string): void;
  }

  declare interface Bound {
    (bin: string, cb: Callback): void;
    sync(bin: string): string;
  }

  declare module.exports: interface {
    (path: string): Bound;
  };

}