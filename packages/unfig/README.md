# unfig

**`unfig`** is a **_framework_** for toolkits.

[Existing toolkits](#Existing_Toolkits) lack sufficient functionality, extendability, and customizability.

A **framework** that supports these features can enable a proliferation of **_quality_** **_full-featured_** **toolkits**.

## Features
**Functionality**: **`unfig` toolkits** provide `commands` and `configurations`.
* `commands` are invoked by the user and can do **_anything_**, e.g. `unfig build`.
* `configurations` are tool configurations, e.g. `.babelrc.js`.
* The **`unfig`** philosophy is that toolkits should provide **_all_** functionality needed to develop and maintain **_quality_** projects.

**Extendability**: **`unfig` toolkits** can extend other **`unfig` toolkits**.
* Any **`unfig` toolkit** can be used as a plugin for another **`unfig` toolkit**.

**Configurability**: **`unfig` toolkits** can be **configured**.
* **`unfig` toolkits** work out of the box, but can be configured.

**Customizability**: **`unfig` toolkits** can be **customized**.
* **`unfig`** recognizes that despite many similarities, every project might be different.

## Usage

#### Install
An **`unfig` toolkit** can be installed with the following commands:

**`npx unfig create [dir] [--toolkit=<package>]`**
Create a new project using the specified toolkit. (User will be queried for dir and toolkit if not provided.)

**`npx unfig init [--toolkit=<package>]`**
Use specified toolkit in an existing project. (User will be queried for toolkit if not provided.)

#### Other
**`npx unfig help`**
Show usage for **`unfig`** commands and any installed toolkit.

**`commands`** provided by the toolkit are shown in **`help`**.

## Creating Toolkits

An **`unfig` toolkit** is a javascript function that (optionally) takes configuration and provides `commands` and `configurations` and `toolDependencies`.

**`unfig` toolkits** can use other **`unfig` toolkits** and can configure them, modify and cusomize their `commands` and `configurations`.

The following example demonstrates all of these features.

### Example

In this example:

`toolkit-1`

- provides `cmd-1` and `config-1.js`

`toolkit-2`

- uses `toolkit-1` and optionally `toolkit-3` (not shown).
- modifies `config-1.js` (from `toolkit-1`).
- provides `cmd-2` (which calls `cmd-1` from `toolkit-1`).
- provides `config-2.js`.

```js
// toolkit-1
module.exports = cfg => {
  const { val } = cfg || { key: 'defaultVal' }; // default cfg
  return {
    commands: {
      'cmd-1': {
        description: 'Run cmd-1',
        handler: ({ args }) => console.log(`Running cmd-1 with args: ${args}`),
      },
    },
    configurations: {
      'config-1.js': () => ({ key: val }), // <-- uses cfg here
    },
  };
};
```

```js
// toolkit-2
module.exports = cfg => {
  return {
    toolkits: [
      require('toolkit-1')(cfg), // use and configure toolkit-1
      cfg.useToolkit3 && require('toolkit-3')(cfg), // conditionally use toolkit-3 (not shown)
    ],
    commands: {
      'cmd-2': {
        description: 'Run cmd-2',
        handler: ({ args, toolkits }) => {
          console.log('running cmd-2');
          return toolkits.execCmd('cmd-1'); // call cmd-1 from toolkit-1
        },
      },
    },
    configurations: {
      'config-1.js': ({ toolkits }) => ({
        ...toolkits.getConfig('config-1.js'),
        key2: 'val2', // add key2 to config1.js object from toolkit-1
      }),
      'config-2.js': () => ({ key: 'val' }),
    },
  };
};
```

#### Using Example Toolkit
A project could use `toolkit-2` by running `npx unfig init --toolkit toolkit-2`.

The project would then contain `config-1.js` and `config-2.js`. See [configurations](#configurations) section for more info.

The user could invoke `cmd-1` by running `npx unfig cmd-1`.

The user could invoke `cmd-2` by running `npx unfig cmd-2`.

## Toolkit Api

The flow definition for the handler arguments can be found [here](github://bradfordlemley/unfig/type-toolkit).

## Real Toolkits

Several toolkits are included in the `unfig` monorepo.

The monorepo contains separate toolkits for each `tool`, e.g. `babel`, `eslint`, `jest`. These are generally very simple toolkits. It is easy to recreate their functionality in higher-level toolkits, but it may be slightly easier to use them.

Following the philosophy that toolkits should include **everything** necessary to maintain a **quality** project, note that several end-user `toolkits`, like react-comp, provide functionality such as auto-formatting of code on commit.

Also, note that there's a monorepo `toolkit`. This toolkit can be installed at the top-level of a monorepo.

## `Configurations`

### Why are `configurations` special?

- `configurations` exist as **standard configuration files on disk** in projects.
  - `configurations` **automatically work with many tools in the ecosystem**.
- `configurations` exist as **objects** within toolkits.
  - `configurations` **can be modified by chains of toolkits**.

### How do `configurations` work?

1. `unfig init` creates `configuration` proxy files _on disk_.

For example, after `unfig init` a project might look like this:

```sh
my-prj/
  .babelrc.js
  .eslintrc.js
  jest.config.js
```

2. The `configuration` proxy files call into **`unfig`** to retrieve the actual configuration from toolkits.

Each of these configuration files contains proxy code:

```js
// .babelrc.js, .eslintrc.js, jest.config.js, etc.
module.exports = require('unfig').getConfig(__filename);
```

### How can `configurations` be modified?

**`unfig`** **does not** provide tools or helpers to modify configs.

If your toolkit modifies `.babelrc.js` from another toolkit, you need to know details about how babel config works, and about the `.babelrc.js` config provided by the other toolkit.

There is no guarantee that your modifications will work for other versions of the toolkit.

Basically, you are [monkey-patching](https://en.wikipedia.org/wiki/Monkey_patch) the `configuration`. Have a good name for this?

### How can actual `configurations` be viewed?

`node -p "require('./.babelrc.js')"`

or

`node -p "JSON.stringify(require('./.babelrc.js'), null, 2)"`

# Existing Toolkits

### Analysis of Existing Toolkits

[create-react-app](https://github.com/facebook/create-react-app): AMAZING! And, yet, severely limiting. Your project will hit a brick wall if you need some functionality it doesn't provide. `Ejecting` leaves you unable to upgrade, `forking` is possible, but has significant complications, and `contributing` is a great option for some cases, but generally not available for customization.

[material-ui](https://github.com/mui-org/material-ui), [formik](https://github.com/jaredpalmer/formik), [react-router](https://github.com/ReactTraining/react-router), [react-redux](https://github.com/reduxjs/react-redux), [downshift](https://github.com/downshift-js/downshift): All awesome! These are similiar projects (at least in that they all provide react components), yet they all use their own custom build systems and project setups. There isn't an equivalent of create-react-app for react components.

# Todos

- [ ] Support for specifying/installing tools
  - Allow toolkits to specify a default set of tools@versions; allow the user to easily update versions; allow tools to be conditionally installed (performance).
- [ ] Support for documenting toolkit config options and interactive configuration during `init`
- [ ] Support for documenting command options
- [ ] Support for initializing toolkit during `init`, e.g. scaffolding code.
- [ ] Support for non-module configurations, e.g. .json configs
- [ ] Support toolkit branding
  - Allow unfig name to be hidden, e.g. `npx mytoolkit create`, `npx mytoolkit build`
