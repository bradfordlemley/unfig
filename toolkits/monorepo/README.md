An **`unfig` toolkit** for monorepos.

## Usage

### Install

**`npx unfig init --toolkit=@unfig/toolkit-monorepo`**
Install toolkit in existing monorepo directory.

**`npx unfig help`**
Show all commands available.

## Features

Installs husky, configured to invoke `pre-commit` script for every package in the monorepo.

**`npx unfig run <cmd>`**
Runs cmd in all packages. For each package: use script `<cmd>` from package.json. If no `<cmd>` script, run `unfig <cmd>` for package if package uses `unfig`.

**`npx unfig runP <cmd>`**
Same as `npx unfig run`, except runs package commands in parallel.

**`npx unfig jest`**
Runs jest in project mode -- runs tests in all monorepo packages in same jest instance.
