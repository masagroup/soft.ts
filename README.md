<!--
sword:
  schema: 1
  name: soft.ts
  family: ecore-esync
  kind: ts-lib
  generation: shared
  shipped: false # UNVERIFIED
  languages: [TypeScript]
  build: [npm, make, docker]
  ng: [ecore-model, storage, esync, webclient]
  apps: []
-->

For the previous documentation of the project (v1), see [README.LEGACY.md](README.LEGACY.md).

# soft.ts

> TypeScript implementation of the EMF Ecore runtime (npm package `@masagroup/ecore`), the base library used by TypeScript code generated from the SWORD ecore models.

| | |
|---|---|
| **Family** | Ecore / esync stack |
| **Languages** | TypeScript (ES modules, target ES2020) |
| **Build systems** | npm (`ecore/package.json`) · GNU Make (root `Makefile`) · Docker only to run the code generator (image `masagroup/soft.gen:v2.0.0-alpha.3`) |

**[Architecture](ARCHITECTURE.md)** · [Contributing](CONTRIBUTING.md) · [previous README (v1)](README.LEGACY.md) · [known issues and open questions](https://github.com/masagroup/wiki/wiki/known-issues#soft.ts) · [repository on GitHub](https://github.com/masagroup/soft.ts)

## Overview

soft.ts is the TypeScript runtime of the Ecore metamodel, published as the npm package `@masagroup/ecore`: the metamodel classes, dynamic and generated `EObject`s, notifications, resources, XML, XMI and binary codecs, ID managers and an `EStore` abstraction. It is the base library of the TypeScript code that [soft.gen](https://github.com/masagroup/soft.gen) generates from the SWORD Ecore models, and it is used by [soft.sync.ts](https://github.com/masagroup/soft.sync.ts) and [sw.webclient](https://github.com/masagroup/sw.webclient). The package is built as ESM and CJS with type declarations.

## Where to start

| You want to... | Read |
|---|---|
| use the library | [Use it](#use-it) below |
| regenerate the sources from the models | [Build](#build) below and [soft.gen](https://github.com/masagroup/soft.gen) |
| understand how it is made | [ARCHITECTURE.md](ARCHITECTURE.md) |
| contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Build

The library has its own `package.json` in `ecore/`, and so does each example package under `examples/`. The root `Makefile` drives all of them and needs GNU make (Git Bash on Windows) and `npm`; Docker is only needed to regenerate code.

### Makefile (Windows and Linux)

```
make ci                  # install, build and test the library and every example, without regeneration
make ecore.ci            # the library only
make library.ci          # one example: empty, library, tournament, inheritance, coexistence
```

The models are read from a sibling folder `../models` (the [soft.models](https://github.com/masagroup/soft.models) repository, cloned under the name `models`):

```
make ecore.generate      # regenerate ecore/src with soft.gen (Docker image masagroup/soft.gen at SOFT_GEN_VERSION)
make ecore               # install, generate, format, build and test the library
make library             # same for one example
make                     # all of the above for the library and the five examples
```

`make GENERATOR="..." ecore.generate` runs another generator command.

### npm (Windows and Linux)

```
cd ecore
npm install --no-fund --loglevel=error
npm run build            # types, ESM and CJS in dist/
npm run pretty           # remove unused imports, then prettier
npm run lint             # oxlint
```

### Use it

```
npm install @masagroup/ecore
```

## Test

```
cd ecore
npm test                              # vitest run
npm run test:coverage                 # with coverage
npx vitest run src/AbstractEList.test.ts   # one test file
make ecore.test                       # same as npm test, from the root
```

## Documentation and guides

- [Architecture](ARCHITECTURE.md): position in the ecosystem, repository layout, internal structure, how it works (diagrams), dependencies, interfaces.
- [Contributing](CONTRIBUTING.md): development environment, Git and Jira workflow, conventions, CI/CD.
- [Previous README (v1)](README.LEGACY.md): the documentation of the repository before the wiki rewrite.
- [Known issues and open questions](https://github.com/masagroup/wiki/wiki/known-issues#soft.ts): the known defects and open points of the repository, kept in the SWORD wiki.
- Related repositories: [soft](https://github.com/masagroup/soft), [soft.gen](https://github.com/masagroup/soft.gen), [soft.models](https://github.com/masagroup/soft.models), [soft.sync.studio](https://github.com/masagroup/soft.sync.studio), [soft.sync.ts](https://github.com/masagroup/soft.sync.ts), [sw.api.ng.ts](https://github.com/masagroup/sw.api.ng.ts), [sw.webclient](https://github.com/masagroup/sw.webclient).
- Transverse pages: [Build on Linux](https://github.com/masagroup/wiki/wiki/build-linux), [CI/CD pipelines](https://github.com/masagroup/wiki/wiki/cicd-pipelines), [esync and ecore](https://github.com/masagroup/wiki/wiki/esync-ecore), [Ecosystem next gen](https://github.com/masagroup/wiki/wiki/ecosystem-nextgen), [Glossary](https://github.com/masagroup/wiki/wiki/glossary).
- Repository on GitHub: [masagroup/soft.ts](https://github.com/masagroup/soft.ts).
- The same documentation in the SWORD wiki: [soft.ts](https://github.com/masagroup/wiki/wiki/soft.ts), [architecture](https://github.com/masagroup/wiki/wiki/soft.ts-architecture), [contributing](https://github.com/masagroup/wiki/wiki/soft.ts-contributing), [previous README](https://github.com/masagroup/wiki/wiki/soft.ts-legacy).
