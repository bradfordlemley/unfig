
declare module 'rollup' {
  // import * as ESTree from "estree";
  // import { EventEmitter } from "events";
  declare var VERSION: string;
  declare type IdMap = {
    [key: string]: string;
  }
  declare type RollupError = {
    stack?: string
  } & RollupLogProps;
  declare type RollupWarning = {
    exporter?: string,
    exportName?: string,
    guess?: string,
    importer?: string,
    missing?: string,
    modules?: string[],
    names?: string[],
    reexporter?: string,
    source?: string,
    sources?: string[]
  } & RollupLogProps;
  declare type RollupLogProps = {
    code?: string;
    frame?: string;
    hook?: string;
    id?: string;
    loc?: {
      file?: string,
      line: number,
      column: number
    };
    message: string;
    name?: string;
    plugin?: string;
    pluginCode?: string;
    pos?: number;
    url?: string;
  }
  declare type ExistingRawSourceMap = {
    version: number;
    sources: string[];
    names: string[];
    sourceRoot?: string;
    sourcesContent?: string[];
    mappings: string;
    file?: string;
  }
  declare type RawSourceMap =
    | {
        mappings: ""
      }
    | ExistingRawSourceMap;
  declare type SourceMap = {
    version: string;
    file: string;
    sources: string[];
    sourcesContent: string[];
    names: string[];
    mappings: string;
    toString(): string;
    toUrl(): string;
  }
  declare type SourceDescription = {
    code: string;
    map?: string | RawSourceMap;
  }
  declare type TransformSourceDescription = {
    // ast?: ESTree.Program,
    dependencies?: string[]
  } & SourceDescription;
  declare type ModuleJSON = {
    id: string;
    dependencies: string[];
    transformDependencies: string[] | null;
    transformAssets: Asset[] | void;
    code: string;
    originalCode: string;
    originalSourcemap: RawSourceMap | void;
    // ast: ESTree.Program;
    sourcemapChain: RawSourceMap[];
    resolvedIds: IdMap;
    customTransformCache: boolean;
  }
  declare type Asset = {
    name: string;
    source: string | Buffer;
    fileName: string;
  }
  declare type PluginCache = {
    has(id: string): boolean;
    get<T>(id: string): T;
    set<T>(id: string, value: T): void;
    delete(id: string): boolean;
  }
  declare type MinimalPluginContext = {
    meta: PluginContextMeta;
  }
  declare type PluginContext = {
    /**
     * @deprecated
     */
    // watcher: EventEmitter,
    addWatchFile: (id: string) => void,
    cache: PluginCache,
    resolveId: ResolveIdHook,
    isExternal: IsExternal,
    // parse: (input: string, options: any) => ESTree.Program,
    emitAsset(name: string, source?: string | Buffer): string,
    setAssetSource: (assetId: string, source: string | Buffer) => void,
    getAssetFileName: (assetId: string) => string,
    warn(
      warning: RollupWarning | string,
      pos?: {
        line: number,
        column: number
      }
    ): void,
    error(
      err: RollupError | string,
      pos?: {
        line: number,
        column: number
      }
    ): void,
    // moduleIds: IterableIterator<string>,
    getModuleInfo: (
      moduleId: string
    ) => {
      id: string,
      isExternal: boolean,
      importedIds: string[]
    }
  } & MinimalPluginContext;
  declare type PluginContextMeta = {
    rollupVersion: string;
  }
  declare type ResolveIdHook = (
    id: string,
    parent: string
  ) => Promise<string | false | null> | string | false | void | null;
  declare type IsExternal = (
    id: string,
    parentId?: string,
    isResolved?: boolean
  ) => boolean | void;
  declare type LoadHook = (
    id: string
  ) =>
    | Promise<SourceDescription | string | null>
    | SourceDescription
    | string
    | null;
  declare type TransformHook = (
    code: string,
    id: string
  ) =>
    | Promise<TransformSourceDescription | string | void>
    | TransformSourceDescription
    | string
    | void;
  declare type TransformChunkHook = (
    code: string,
    options: OutputOptions
  ) =>
    | Promise<{
        code: string,
        map: RawSourceMap
      } | void>
    | {
        code: string,
        map: RawSourceMap
      }
    | void
    | null;
  declare type RenderChunkHook = (
    code: string,
    chunk: RenderedChunk,
    options: OutputOptions
  ) =>
    | Promise<{
        code: string,
        map: RawSourceMap
      } | null>
    | {
        code: string,
        map: RawSourceMap
      }
    | string
    | null;
  declare type ResolveDynamicImportHook = (
    // specifier: string | ESTree.Node,
    parentId: string
  ) => Promise<string | void> | string | void;
  declare type AddonHook = string | (() => string | Promise<string>);
  /**
   * use this type for plugin annotation
   * @example ```ts
   *  * type Options {
   *  * ...
   *  * }
   *  * const myPlugin: PluginImpl<Options> = (options = {}) => { ... }
   *  * ```
   */
  declare type PluginImpl<O: { [key: string]: any } = { [key: string]: any }> = (
    options?: O
  ) => Plugin;
  declare type OutputBundle = {
    [fileName: string]: OutputAsset | OutputChunk;
  }
  declare type Plugin = {
    banner?: AddonHook;
    buildEnd?: (err?: Error) => Promise<void> | void;
    buildStart?: (options: InputOptions) => Promise<void> | void;
    cacheKey?: string;
    footer?: AddonHook;
    generateBundle?: (
      options: OutputOptions,
      bundle: OutputBundle,
      isWrite: boolean
    ) => void | Promise<void>;
    writeBundle?: (bundle: OutputBundle) => void | Promise<void>;
    intro?: AddonHook;
    load?: LoadHook;
    name: string;

    /**
     * @deprecated
     */
    ongenerate?: (
      options: OutputOptions,
      chunk: OutputChunk
    ) => void | Promise<void>;

    /**
     * @deprecated
     */
    onwrite?: (
      options: OutputOptions,
      chunk: OutputChunk
    ) => void | Promise<void>;
    options?: (options: InputOptions) => InputOptions | void | null;
    outro?: AddonHook;
    renderChunk?: RenderChunkHook;
    renderError?: (err?: Error) => Promise<void> | void;
    renderStart?: () => Promise<void> | void;
    resolveDynamicImport?: ResolveDynamicImportHook;
    resolveId?: ResolveIdHook;
    transform?: TransformHook;

    /**
     * @deprecated
     */
    transformBundle?: TransformChunkHook;

    /**
     * @deprecated
     */
    transformChunk?: TransformChunkHook;
    watchChange?: (id: string) => void;
  }
  declare type TreeshakingOptions = {
    propertyReadSideEffects: boolean;
    pureExternalModules: boolean;
  }
  declare type ExternalOption = Array<string> | IsExternal;
  declare type GlobalsOption =
    | {
        [name: string]: string
      }
    | ((name: string) => string);
  declare type InputOption =
    | string
    | string[]
    | {
        [entryAlias: string]: string
      };
  declare type InputOptions = {
    // acorn?: any;
    // acornInjectPlugins?: Function[];
    cache?: false | RollupCache;
    chunkGroupingSize?: number;
    context?: string;
    experimentalCacheExpiry?: number;
    experimentalOptimizeChunks?: boolean;
    experimentalTopLevelAwait?: boolean;
    external?: ?IsExternal | ?Array<string>;
    inlineDynamicImports?: boolean;
    input: InputOption;
    manualChunks?: {
      [chunkAlias: string]: string[]
    };
    moduleContext?:
      | ((id: string) => string)
      | {
          [id: string]: string
        };
    onwarn?: WarningHandler;
    perf?: boolean;
    plugins?: Array<Plugin | false>;
    preserveModules?: boolean;
    preserveSymlinks?: boolean;
    shimMissingExports?: boolean;
    treeshake?: boolean | TreeshakingOptions;
    watch?: WatcherOptions;
  }
  declare type ModuleFormat =
    | "amd"
    | "cjs"
    | "system"
    | "es"
    | "esm"
    | "iife"
    | "umd";
  declare type OptionsPaths = {[string]: string} | ((id: string) => string);
  declare type OutputOptions = {
    amd?: {
      id?: string,
      define?: string
    };
    assetFileNames?: string;
    banner?: string | (() => string | Promise<string>);
    chunkFileNames?: string;
    compact?: boolean;
    dir?: string;
    exports?: "default" | "named" | "none" | "auto";
    entryFileNames?: string;
    esModule?: boolean;
    extend?: boolean;
    file?: string;
    footer?: string | (() => string | Promise<string>);
    format?: ModuleFormat;
    freeze?: boolean;
    globals?: ?GlobalsOption;
    indent?: boolean;
    interop?: boolean;
    intro?: string | (() => string | Promise<string>);
    name?: string;
    namespaceToStringTag?: boolean;
    noConflict?: boolean;
    outro?: string | (() => string | Promise<string>);
    paths?: OptionsPaths;
    preferConst?: boolean;
    sourcemap?: boolean;
    sourcemapExcludeSources?: boolean;
    sourcemapFile?: string;
    sourcemapPathTransform?: (sourcePath: string) => string;
    strict?: boolean;
  }
  declare type WarningHandler = (warning: string | RollupWarning) => void;
  declare type SerializedTimings = {
    [label: string]: [number, number, number];
  }
  declare type OutputAsset = {
    isAsset: true;
    code?: void;
    fileName: string;
    source: string | Buffer;
  }
  declare type RenderedModule = {
    renderedExports: string[];
    removedExports: string[];
    renderedLength: number;
    originalLength: number;
  }
  declare type RenderedChunk = {
    dynamicImports: string[];
    exports: string[];
    facadeModuleId: string | null;
    fileName: string;
    imports: string[];
    isDynamicEntry: boolean;
    isEntry: boolean;
    modules: {
      [id: string]: RenderedModule
    };
    name: string;
  }
  declare type OutputChunk = {
    code: string,
    map?: SourceMap
  } & RenderedChunk;
  declare type SerializablePluginCache = {
    [key: string]: [number, boolean];
  }
  declare type RollupCache = {
    modules?: ModuleJSON[];
    plugins?: {[string]: SerializablePluginCache};
  }
  declare type RollupOutput = {
    output: (OutputChunk | OutputAsset)[];
  }
  declare type RollupBuild = {
    cache: RollupCache;
    watchFiles: string[];
    generate: (outputOptions: OutputOptions) => Promise<RollupOutput>;
    write: (options: OutputOptions) => Promise<RollupOutput>;
    getTimings?: () => SerializedTimings;
  }
  declare type RollupOptions = {
    output?: OutputOptions | Array<OutputOptions>,
  } & InputOptions;
  declare function rollup(options: RollupOptions): Promise<RollupBuild>;
  declare type WatchOptions = {
    persistent?: boolean;
    // ignored?: any;
    ignoreInitial?: boolean;
    followSymlinks?: boolean;
    cwd?: string;
    disableGlobbing?: boolean;
    usePolling?: boolean;
    useFsEvents?: boolean;
    alwaysStat?: boolean;
    depth?: number;
    interval?: number;
    binaryInterval?: number;
    ignorePermissionErrors?: boolean;
    atomic?: boolean | number;
    awaitWriteFinish?:
      | {
          stabilityThreshold?: number,
          pollInterval?: number
        }
      | boolean;
  }
  declare type WatcherOptions = {
    chokidar?: boolean | WatchOptions,
    include?: string[],
    exclude?: string[],
    clearScreen?: boolean,
  }
  declare type RollupWatchOptions = {
    output?: OutputOptions | OutputOptions[],
    watch?: WatcherOptions
  } & InputOptions;
  declare type RollupWatcher = {
    close(): void
  } /* & EventEmitter */;
  declare function watch(configs: RollupWatchOptions[]): RollupWatcher;
}