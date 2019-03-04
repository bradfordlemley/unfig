// @flow
const fs = require('fs-extra');
const path = require('path');
const { genFromFile, templateDir } = require('./templates');
const getEnv = require('./env');

/*::

import {type PkgJson} from '@unfig/type-pkg-json';
import type { Plugin, LoadedPlugin, GetModuleHandler, Command, EnvType } from '@unfig/type-toolkit';

type NormalizedPluginType = {|
  dependencies: { [string] : string},
  toolkits: Array<Plugin>,
  modules: {
    [string]: GetModuleHandler<>,
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
  const toolkit = {
    dependencies: base.dependencies,
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
        return child.commands[cmd].exec(args);
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
      return toolkit.commands[cmd].exec(args);
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
    p.dependencies && mergeObj(toolkit.dependencies, p.dependencies);
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

function preloadPlugin(
  toolkit /* :$ReadOnly<Plugin> */,
  env
) /* :NormalizedPluginType */ {
  const toolkits = toolkit.toolkits ? stripArr(toolkit.toolkits) : [];
  const preloaded = {
    dependencies: toolkit.dependencies || {},
    filepath: toolkit.filepath,
    modules: stripObj(toolkit.modules),
    commands: stripObj(toolkit.commands),
    toolkits,
  };

  if (toolkit.load) {
    const loadedParts = toolkit.load(env);
    const { modules, commands, dependencies } = loadedParts;

    mergeObj(preloaded.modules, modules);
    mergeObj(preloaded.commands, commands);
    mergeObj(preloaded.dependencies, dependencies);

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

function loadUnfig(filepath /*: string */, env /*: $ReadOnly<EnvType> */) {
  // $ExpectError: dynamic require
  const mod = require(filepath);
  if (typeof mod === 'function') {
    throw new Error(`Unfig module should not be a function, in ${filepath}`);
  }
  mod.filepath = filepath;
  return loadPlugin(mod, env, []);
}

function getUnfig(start /*: string */, gArgs /*: ?$ReadOnlyArray<string> */) {
  const env /*: $ReadOnly<EnvType> */ = getEnv(start, gArgs);
  return {
    unfig: env.cfg && loadUnfig(env.cfg.cfgFile, env),
    env,
  };
}

// function enumUnfig(
//   env /* :$ReadOnly<EnvType> */,
//   cb /* :LoadedPlugin => boolean */
// ) {
//   let currDir = env.rootDir;
//   for (;;) {
//     const cfgMod = getUnfig(env);
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
  getUnfig,
  writeConfig,
};
