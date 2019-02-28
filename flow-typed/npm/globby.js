declare module "globby" {
  declare type Options = {
    absolute?: boolean,
    cwd?: string,
    gitignore?: boolean,
    strict?: boolean,
  };

  declare interface Globby {
    (patterns: string, options?: Options): Promise<Array<string>>;
    sync(patterns: string, options: ?Options): Array<string>;
  }

  declare module.exports: Globby;
}