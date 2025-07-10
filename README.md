# Project Hermes...

Your project's description...

## Environments

- Preview: https://main--2025recordedfuturewebsite--recorded-future-website.aem.page/
- Live: https://main--2025recordedfuturewebsite--recorded-future-website.aem.live/

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:

1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Setup Git Hooks

```shell
npm run prepare
```

## Linting (all files)

```sh
npm run lint
```

## Formatting (all files)

```sh
npm run format
```

## Format Staged Files Only

```shell
## pre-commit hook will trigger this command automatically if Git Hooks is configured properly
## Alternatively, always run this manually before a commit

npx lint-staged
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

## Git Hooks

1. Make sure `npm run prepare` was ran once to setup the Git Hooks
2. On commit, it should auto trigger linter and formatters on staged files
3. On push, it should run unit tests if tests are configured

Note: If you use a Git UI Client, there is a chance, depending on how your client was started, it might not be able to trigger Git Hooks. You should try to commit and push your changes using git CLI.
