[![Build Status](https://dev.azure.com/unfig/unfig/_apis/build/status/bradfordlemley.unfig?branchName=master)](https://dev.azure.com/unfig/unfig/_build/latest?definitionId=1&branchName=master)

# unfig

**`unfig`** is a **_framework_** for creating zero-config toolkits.

* **`unfig`** toolkits can be configured and customized...no need to eject, no need to fork.

* **`unfig`** toolkits can be extended and combined with other unfig toolkits to create new unfig toolkits.

The **`unfig`** philosophy is that toolkits should support **_everything_** needed to develop and maintain **_quality_** projects -- much more functionality than is typically included in [current-generation toolkits](#Current-generation_Toolkits).  For example, toolkits should automatically enable commit hooks to prettify code.

**`unfig`** recognizes the need for customization and that is typically not supported by one-off zero-config toolkits, which is why a framework that enables these things is needed.  Instead of ejecting or forking, extend an existing toolkit...and publish it for others to use.  (Forking is an option...the decision to fork vs. extend is at the discretion of the developer.)

The **`unfig`** theory is that a **framework** that naturally supports these features can **enable a proliferation of quality _full-featured_ zero-config toolkits**.
* Projects can adopt unfig toolkits without concern of lock-in because escape hatches are built in.
* Toolkits can be improved, enhanced, extended, and shared and can evolve quickly.

#### Example
If a tool like create-react-app was built on the **unfig** framework, it would require much less code to implement and would be naturally customizable and extendable.

#### What's the magic?

**`unfig`** toolkits utilize standard on-disk tool configuration files (e.g. .babelrc) -- they don't hide tool configurations like many current generation zero-config toolkits.  This allows interoperability with existing eco-system tooling as well as interoperability between unfig toolkits.

#### Status
Unfig is currently in alpha, proof-of-concept stage.  There is a working toolkit for react components which utilizes several other toolkits.

There's a lot of work to be done.

## Overview
 
The **`unfig`** framework is simple.  All functionality comes from **`toolkits`**.

**`unfig` toolkits** provide:
* **`commands`**, which can be invoked by the user, like `build`.
* **`configurations`**, which are tool configurations, like `.babelrc.js`.
* **`dependencies`**, which are tools used by the toolkit, like `babel`.

The **`unfig`** framework enables toolkits to utilize other toolkits -- to configure them, inherit their functionality, and/or customize their **`commands`**, **`configurations`**, and **`dependencies`**.

A key part of the **`unfig`** framework is that **`configurations` exist as _standard configuration files on disk_ in projects**.

This allows the `configurations` to integrate seemlessly with tools in the ecosystem.  Generally, standard tools don't need to be integrated into `unfig`, they "just work".

See more details about [configurations](#configurations) and [dependencies](#dependencies) below.

## Usage

End users can utilzie a **toolkit** in their project by invoking one of the commands below.

**`npx unfig create [dir] [--toolkit=<toolkit>]`**
Create a new project using the specified toolkit. (User will be queried for dir and toolkit if not provided.)

**`npx unfig init [--toolkit=<toolkit>]`**
Use specified toolkit in an existing project. (User will be queried for toolkit if not provided.)

**`commands`** provided by the **toolkit** are shown in **`unfig help`**.

## Toolkits

An **`unfig` toolkit** is a javascript function that takes an optional configuration object and returns an object with **`commands`**, **`configurations`**, and **`toolDependencies`**.

```js
// shape of an unfig toolkit module
module.exports = config => ({
  commands: {},
  configurations: {},
  toolDependencies: {},
})
```

### Toolkit Type Definition
The complete flow type definition for a toolkit can be found [here](https://github.com/bradfordlemley/unfig/blob/33e549d111a8508cec176afd5c853b52df44fff8/packages/type-toolkit/index.js.flow#L66).

### Real Toolkit Examples
Several real toolkits are included in the `unfig` monorepo.

The monorepo contains a simple toolkits for each tool, e.g. `babel`, `eslint`, `jest`. These are generally very simple toolkits providing a single `command` and a single `configuration`.

`react-comp` is a `toolkit` which supports a react component.

`bare-node` is a `toolkit` which supports node scripts and is used by toolkits themselves.

`monorepo` is a `toolkit` which can be installed at the top-level of a monorepo.

### Demonstration Example

This contrived example shows two **toolkits**:

**`toolkit-1`**
- provides `cmd-1` and `config-1.js`

**`toolkit-2`**
- uses `toolkit-1` and `toolkit-3` (not shown).
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

#### Using Example
A project could use `toolkit-2` by running `npx unfig init --toolkit toolkit-2`.

The project would then contain `config-1.js` and `config-2.js`. See [configurations](#configurations) section for more info.

The user could invoke `cmd-1` by running `npx unfig cmd-1`.

The user could invoke `cmd-2` by running `npx unfig cmd-2`.

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

## `Dependencies`
`dependencies` specified by a toolkit end up installed as devDependencies in a project.

They serve two purposes:

1.  They allow toolkits or end users to change/modify tool versions without requiring a new version of a toolkit.
2.  They allow modules to be resolved when referenced from the project.

For example, this allows `babel` to work directly in the project, the same way it works when invoked from a toolkit.  `babel` version, and any plugins used by `.babelrc.js` configuration, can be modified by toolkits, or by the end user, and will be used whether `babel` is invoked directly from the project, or from a toolkit.

Note: `unfig init` installs `dependencies` as `devDependencies`.  This modifies `devDependencies` in the project's package.json.

# Current-generation Toolkits

[create-react-app](https://github.com/facebook/create-react-app): AMAZING! And, yet, severely limiting. Your project will hit a brick wall if you need some functionality it doesn't provide. `Ejecting` leaves you unable to upgrade, `forking` is possible, but has significant complications, and `contributing` is a great option for some cases, but generally not available for customization.

[material-ui](https://github.com/mui-org/material-ui), [formik](https://github.com/jaredpalmer/formik), [react-router](https://github.com/ReactTraining/react-router), [react-redux](https://github.com/reduxjs/react-redux), [downshift](https://github.com/downshift-js/downshift): All awesome! These are similiar projects (at least in that they all provide react components), yet they all use their own custom build systems and project setups. There isn't an equivalent of create-react-app for react components.
