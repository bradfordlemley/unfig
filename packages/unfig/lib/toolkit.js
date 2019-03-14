// @flow
const findPkg = require('@unfig/find-pkg');
const fs = require('fs-extra');
const path = require('path');
const { genFromFile, templateDir } = require('./templates');
const getEnv = require('./env');

/*::

import {type PkgJson} from '@unfig/type-pkg-json';
import type { Plugin, LoadedPlugin, GetModuleHandler, GetJsonHandler, Command, EnvType } from '@unfig/type-toolkit';

type NormalizedPluginType = {|
  toolDependencies: { [string] : string},
  toolkits: Array<Plugin>,
  modules: {
    [string]: GetModuleHandler<>,
  },
  jsonFiles: {
    [string]: GetJsonHandler,
  },
  commands: {
    [string]: Command,
  },
  filepath: string,
|};

*/

function makePlugin(
  base,
  toolkits /*: Array<LoadedPlugin> */,
  env /* :$ReadOnly<EnvType> */
) /* :LoadedPlugin */ {
  // for flow type-checking, initialize commands with proper type
  function seedCommands(commands) {
    const out = {};
    Object.keys(commands).forEach(key => {
      out[key] = {
        ...commands[key],
        exec: () => ({ code: 1 }),
      };
    });
    return out;
  }

  function seedModules(modules) {
    const out = {};
    Object.keys(modules).forEach(key => {
      out[key] = {
        handler: modules[key],
        get: () => ({}),
      };
    });
    return out;
  }
  function seedDependencies(dependencies) {
    const out = {};
    dependencies &&
      Object.keys(dependencies).forEach(key => {
        out[key] = {
          version: dependencies[key],
          toolkit: base.filepath,
        };
      });
    return out;
  }
  function seedJsonFiles(jsonFiles) {
    const out = {};
    jsonFiles &&
      Object.keys(jsonFiles).forEach(key => {
        out[key] = {
          handler: jsonFiles[key],
          toolkit: base.filepath,
        };
      });
    return out;
  }
  const toolkit = {
    jsonFiles: seedJsonFiles(base.jsonFiles),
    toolDependencies: seedDependencies(base.toolDependencies),
    filepath: base.filepath,
    modules: seedModules(base.modules),
    commands: seedCommands(base.commands),
    toolkits,
    children: {
      execCmd: async (cmd, args) => {
        const child = toolkits.find(toolkit => toolkit.commands[cmd]);
        if (!child) {
          throw new Error(`Command ${cmd} not available in toolkits`);
        }
        return child.commands[cmd].exec(args || []);
      },
      getModule: requestFile => {
        const baseFile = path.basename(requestFile);
        const child = toolkits.find(toolkit => toolkit.modules[baseFile]);
        if (!child) {
          throw new Error(
            `Base ${baseFile} for ${requestFile} not available in toolkits`
          );
        }
        return child.modules[baseFile].get(requestFile);
      },
    },
    execCmd: async (cmd, args) => {
      if (!toolkit.commands[cmd]) {
        throw new Error(
          `Command ${cmd} is not supported by toolkit: ${toolkit.filepath}`
        );
      }
      return toolkit.commands[cmd].exec(args || []);
    },
    getModule: requestFile => {
      const baseFile = path.basename(requestFile);
      if (toolkit.modules == null || !toolkit.modules[baseFile]) {
        throw new Error(
          `File ${baseFile} for ${requestFile} is not supported by toolkit: ${
            toolkit.filepath
          }`
        );
      }
      return toolkit.modules[baseFile].get(requestFile);
    },
  };

  function bindCommands(commands) {
    const out = {};
    Object.keys(commands).forEach(key => {
      out[key] = {
        ...commands[key],
        exec: args =>
          commands[key].handler({ args, env, argv: {}, self: toolkit }),
      };
    });
    return out;
  }

  function bindModules(modules) {
    const out = {};
    Object.keys(modules).forEach(key => {
      out[key] = {
        handler: modules[key],
        get: requestFile => modules[key]({ requestFile, env, self: toolkit }),
      };
    });
    return out;
  }

  toolkit.commands = bindCommands(base.commands);

  toolkit.modules = bindModules(base.modules);

  toolkits.forEach(p => {
    p.commands && mergeObj(toolkit.commands, p.commands);
    p.modules && mergeObj(toolkit.modules, p.modules);
    p.toolDependencies &&
      mergeObj(toolkit.toolDependencies, p.toolDependencies);
    p.jsonFiles && mergeObj(toolkit.jsonFiles, p.jsonFiles);
  });

  return toolkit;
}

function stripArr /*::<T> */(
  arr /*: $ReadOnlyArray<?T|false> */
) /* :Array<T> */ {
  const out = [];
  arr.forEach(i => {
    if (i != null && i !== false) {
      out.push(i);
    }
  });
  return out;
}

function stripObj /*:: <T> */(
  obj /* :?{[key :string]: T|?T|false} */
) /* :{[key :string]: T} */ {
  const out = {};
  obj &&
    Object.keys(obj).forEach(key => {
      if (obj && obj[key] != null && obj[key] !== false) {
        out[key] = obj[key];
      }
    });
  return out;
}

function mergeObj /*:: <T> */(
  master /* :{[key :string]: T} */,
  child /* :?$ReadOnly<{[key :string]: ?T|false}> */,
  override = false
) {
  child &&
    Object.keys(child).forEach(key => {
      if (
        child &&
        child[key] != null &&
        child[key] !== false &&
        (override || master[key] == null)
      ) {
        master[key] = child[key];
      }
    });
}

const unfigDepRegex = /@?unfig/;

function filterDeps(deps) {
  const d = {};
  deps &&
    Object.keys(deps)
      .filter(dep => !dep.match(unfigDepRegex))
      .forEach(dep => (d[dep] = deps[dep]));
  return d;
}

function getToolDeps(toolDeps, pkg) /*: { [string]: string }*/ {
  if (typeof toolDeps === 'boolean') {
    return toolDeps
      ? filterDeps(pkg && pkg.pkgJson && pkg.pkgJson.devDependencies)
      : {};
  }
  if (typeof toolDeps === 'function') {
    return toolDeps(pkg);
  }
  if (typeof toolDeps === 'object') {
    return (toolDeps /*: {[string]: string} */);
  }
  return {};
}

function preloadPlugin(
  toolkit /* :$ReadOnly<Plugin> */,
  env
) /* :NormalizedPluginType */ {
  const toolkits = toolkit.toolkits ? stripArr(toolkit.toolkits) : [];
  const pkg = findPkg(toolkit.filepath);
  const preloaded = {
    toolDependencies: getToolDeps(toolkit.toolDependencies, pkg),
    filepath: toolkit.filepath,
    modules: stripObj(toolkit.modules),
    commands: stripObj(toolkit.commands),
    toolkits,
    jsonFiles: stripObj(toolkit.jsonFiles),
  };

  if (toolkit.load) {
    const loadedParts = toolkit.load(env);
    const { modules, commands, jsonFiles, toolDependencies } = loadedParts;

    mergeObj(preloaded.modules, modules);
    mergeObj(preloaded.commands, commands);
    mergeObj(preloaded.toolDependencies, getToolDeps(toolDependencies, pkg));
    mergeObj(preloaded.jsonFiles, stripObj(jsonFiles));
    if (loadedParts.toolkits) {
      preloaded.toolkits = preloaded.toolkits.concat(
        stripArr(loadedParts.toolkits)
      );
    }
  }

  return preloaded;
}

function loadPlugin(
  pluginEntry /* :$ReadOnly<Plugin> */,
  env /* :$ReadOnly<EnvType> */,
  pluginChain /*: $ReadOnlyArray<string> */
) /* :LoadedPlugin */ {
  let toolkit;

  if (Array.isArray(pluginEntry) || typeof pluginEntry === 'string') {
    throw new Error(
      `Plugin entry must be an object, got: ${JSON.stringify(pluginEntry)}`
    );
  } else if (typeof pluginEntry === 'function') {
    toolkit = pluginEntry();
  } else {
    toolkit = { ...pluginEntry };
  }

  if (!toolkit.filepath) {
    throw new Error(
      `Plugin does not have filepath; toolkit: ${JSON.stringify(toolkit)}`
    );
  }

  if (
    !toolkit.toolkits &&
    !toolkit.modules &&
    !toolkit.commands &&
    !toolkit.load
  ) {
    throw new Error(
      `Empty toolkit.  Plugin must have toolkits, commands, modules, or load; toolkit: ${JSON.stringify(
        toolkit
      )}`
    );
  }

  if (toolkit.toolkits) {
    if (!Array.isArray(toolkit.toolkits)) {
      throw new Error(
        `Toolkits must be an array, got ${JSON.stringify(toolkit.toolkits)}`
      );
    }
  }

  const nPlugin = preloadPlugin(toolkit, env);

  const toolkits = nPlugin.toolkits.map(childPlugin =>
    loadPlugin(childPlugin, env, pluginChain.concat([nPlugin.filepath]))
  );

  return makePlugin(nPlugin, toolkits, env);
}

function loadToolkitFromEnv(env /*: $ReadOnly<EnvType> */) {
  if (!env.cfg) {
    return undefined;
  }
  const { cfgFile } = env.cfg;
  // $ExpectError: dynamic require
  const mod = require(cfgFile);
  if (typeof mod === 'function') {
    throw new Error(`Unfig module should not be a function, in ${cfgFile}`);
  }
  mod.filepath = cfgFile;
  return loadPlugin(mod, env, []);
}

function loadToolkit(
  start /*: string */,
  gArgs /*: ?$ReadOnlyArray<string> */
) {
  const env /*: $ReadOnly<EnvType> */ = getEnv(start, gArgs);
  return loadToolkitFromEnv(env);
}

// function enumUnfig(
//   env /* :$ReadOnly<EnvType> */,
//   cb /* :LoadedPlugin => boolean */
// ) {
//   let currDir = env.rootDir;
//   for (;;) {
//     const cfgMod = loadToolkit(env);
//     if (!cfgMod) {
//       break;
//     }
//     const stop = cb(cfgMod);
//     if (stop) {
//       break;
//     }
//     currDir = path.dirname(path.dirname(cfgMod.filepath));
//   }
// }

function writeConfig(
  filepath /* :string */,
  config /* :{|toolkit: string|} */
) {
  const content = genFromFile(
    path.join(templateDir, 'unfig-template.js'),
    config
  );
  fs.writeFileSync(filepath, content);
  delete require.cache[filepath];
}

module.exports = {
  loadToolkit,
  loadToolkitFromEnv,
  writeConfig,
};
