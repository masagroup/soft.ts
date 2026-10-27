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

**[Architecture](ARCHITECTURE.md)** · [Contributing](CONTRIBUTING.md) · [previous README (v1)](README.LEGACY.md) · [known issues and open questions](https://claude.ai/artifact/UfvKmky7e8LwEXf192hQjQ#soft.ts) · [repository on GitHub](https://github.com/masagroup/soft.ts)

## Overview

Soft TS is the TypeScript member of the "Soft" family (soft.go, soft.cpp, soft.gen, soft.models). It provides the Ecore metamodel (EClass, EPackage, ...), dynamic and generated EObjects, notifications, resources and resource sets, XML/XMI/binary (msgpack) codecs, ID managers and an `EStore` abstraction. The README states that it "is partially generated and referenced by the Soft TS Generator" (`masagroup/soft.gen`), and that it is part of `masagroup/soft`.

<details>
<summary>More</summary>

It is a pure in-process library: no executable, no network code, no ports. Everything that talks to the outside is a consumer of this package.

- Version: `1.7.2` (latest tag `v1.7.2`), license MPL-2.0.
- Dual ESM + CJS package with generated type declarations.
- Consumers: the examples of this repo (`file:../../ecore`), [soft.sync.ts](https://github.com/masagroup/soft.sync.ts) (`@masagroup/esync`), [sw.api.ng.ts](https://github.com/masagroup/sw.api.ng.ts), [sw.webclient](https://github.com/masagroup/sw.webclient), and `soft.sync.studio/app` ([soft.sync.studio](https://github.com/masagroup/soft.sync.studio)).
- The meta-repo [soft](https://github.com/masagroup/soft) declares this repo as its `ts` submodule (`soft/.gitmodules`, url `https://github.com/masagroup/soft.ts.git`). The checkout of that submodule in the workspace is a separate, older checkout (package version `1.0.4`, layout `ecore`/`library`, no `examples/`).

</details>

The diagram of this overview is in [Architecture](ARCHITECTURE.md#overview).

## Build

Only the Node/npm toolchain and a root GNU `Makefile` are present.

### Linux (Docker)

Not applicable for the build. Docker only runs the generator: the `*.generate` targets of the Makefile run the image `masagroup/soft.gen` (see below).

### Makefile (Windows and Linux)

```
# CI-equivalent (install + build + test, no regeneration)
make ci
```

```
make ecore.generate
```

```
docker run --rm $(SOFT_GEN_USER) -v $(CURDIR):/soft/ts -v $(MODELS):/soft/models -w /soft/ts masagroup/soft.gen:v2.0.0-alpha.3 ts -m ../models/<model>.ecore -o ./<out> -P .generator.yaml <opts>
```

<details>
<summary>Details</summary>

The root `Makefile` drives the whole build (library and examples). It detects the OS (`OS=Windows_NT` selects `where` and `NUL`, otherwise `which` and `/dev/null`; the generator container gets `--user <uid>:<gid>` on non-Windows only). Run `make <target>` from the repo root: from Git Bash (or any shell with a `make` from a toolset on the PATH) on Windows, from any shell on Linux.

#### Prerequisites

- Node 24.21.0 in CI (`.github/workflows/build_and_test.yaml`); `engines.node >= 16` in `ecore/package.json`.
- Dev dependencies: TypeScript `^7.0.2`, vitest `^5.0.4`, prettier `^3.9.10`, oxlint `^1.88.0`, ncp `^2.0.0`.
- `make` and `npm` must be on the PATH. UNVERIFIED which `make` implementation Windows developers use.
- Docker is needed only to regenerate code: the generator soft.gen v2 runs from its image `masagroup/soft.gen:$(SOFT_GEN_VERSION)` (`v2.0.0-alpha.3`). Go is not needed (up to v1.7.0 the Makefile ran `soft-gen` with `go`, else `go.exe`, else `go` in a golang container). Not needed for `make ci`.

#### Commands

Commands to run from the repo root:

Regenerate the generated sources (needs Docker and the `soft.models` repo as `../models`):

#### Targets

Root `Makefile` targets:

<details>
<summary>Target / Chain / action (11 rows)</summary>

| Target | Chain / action |
|---|---|
| `all` | `ecore empty library tournament inheritance coexistence` (full regeneration + build + test) |
| `ci` | `ecore.ci empty.ci library.ci tournament.ci inheritance.ci coexistence.ci` (install + build + test, no generation) |
| `ecore` | `ecore.install ecore.generate ecore.format ecore.build ecore.test` |
| `ecore.ci` | `ecore.install ecore.build ecore.test` |
| `ecore.install` | `cd ecore && npm install --no-fund --loglevel=error` |
| `ecore.generate` | `soft.gen ts` on `ecore.ecore` with `-t generateModel -t generateTests -p printWidth=140` |
| `ecore.format` / `ecore.build` / `ecore.test` | `npm run pretty` / `build` / `test` in `ecore/` |
| `examples` | `library empty` (`tournament`, `inheritance` and `coexistence` are not part of `examples`) |
| `library`, `empty`, `tournament`, `inheritance`, `coexistence` | `<x>.install <x>.generate <x>.format <x>.build <x>.test` |
| `<x>.ci` | `<x>.install <x>.build <x>.test` |
| `<x>.generate` | `soft.gen ts` on `library.ecore` (`-p accessors=property`), `empty.ecore` (no extra option), `tournament.ecore` (`-p async=true`), output to `examples/`; `inheritance` from its own model `examples/inheritance/inheritance.ecore`; `coexistence` runs three generations of `tournament.ecore` (interfaces, typed and reflective implementations, see the architecture section below) |

</details>

Generator invocation (`Makefile`): the model is generated with soft.gen v2 (`soft.gen ts`, a Go tool run from its Docker image `masagroup/soft.gen`), not with the former Java generator or the `masagroup/soft.generator.ts` Docker image.

- `GENERATOR` is the `soft.gen ts` command: a `docker run` of `SOFT_GEN_IMAGE` (`masagroup/soft.gen:$(SOFT_GEN_VERSION)`, `SOFT_GEN_VERSION` = `v2.0.0-alpha.3`) with the checkout mounted on `/soft/ts` and the models folder `MODELS` (`$(realpath ../models)`) on `/soft/models`; on Linux `SOFT_GEN_USER` (`--user <uid>:<gid>`) gives the generated files to the user. It stops with `"../models not found"` when that folder is missing. Another generator can be given on the command line (`make GENERATOR="..."`). Up to v1.7.0 it was `$(SOFT_GEN_GO) run github.com/masagroup/soft.gen/v2/cmd/soft-gen@v2.0.0-alpha.2 ts` (the command is `cmd/soft-gen` up to soft.gen `v2.0.0-alpha.2`, `cmd/soft.gen` from `v2.0.0-alpha.3`).
- `GENERATE` (`$(call GENERATE,<output folder>,<model>,<options>)`) generates from a model of `../models` with `.generator.yaml`; `GENERATE_EXAMPLE` (`$(call GENERATE_EXAMPLE,<name>,<options>)`) generates an example from its own model `examples/<name>/<name>.ecore` into `examples/`.
- The Makefile expects the [soft.models](https://github.com/masagroup/soft.models) repo as a sibling directory named `models` (`../models`). On the reference workstation the sibling is named `soft.models`, so a `models` directory or link would be needed. UNVERIFIED how the team handles it locally.
- `.generator.yaml`: MPL 2.0 license header (`fileNotes`, "Copyright(c) 2024 MASA Group"), `packageDir: $1/src`, `testFramework: vitest` (the same properties were in `generator.properties` up to v1.7.0).

</details>

### package.json (Windows and Linux)

There is no `package.json` at the repo root: the library has its own in `ecore/`, and each example package has one too. `node` and `npm` are the only requirements, the same on Windows and Linux. Library only:

```
cd ecore
npm install --no-fund --loglevel=error
npm run build
npm test
```

<details>
<summary>Details</summary>

npm scripts of `ecore/package.json`:

| Script | Command |
|---|---|
| `build` | `npm run build-types && npm run build-esm && npm run build-cjs` |
| `build-types` | `tsc -b tsconfig.types.json` (declarations into `dist/types`) |
| `build-esm` | `tsc -b tsconfig.esm.json` (into `dist/esm`) |
| `build-cjs` | `tsc -b tsconfig.cjs.json && ncp ./package-cjs.json ./dist/cjs/package.json` (CommonJS in `dist/cjs`, with a `{"type":"commonjs"}` package.json) |
| `pretty` | `node scripts/remove-unused-imports.mjs && prettier --write src/**/*.ts` |
| `lint` | `oxlint src` |
| `test` | `vitest run` (config `ecore/vite.config.ts`: include `src/**/*.test.ts`) |
| `test:coverage` | `vitest run --coverage` (`@vitest/coverage-v8`) |

`ecore/scripts/remove-unused-imports.mjs` runs oxlint (rule `no-unused-vars`) in JSON mode and strips only unused import specifiers (unlike `oxlint --fix`). The example packages reuse it through `../../ecore/scripts/remove-unused-imports.mjs`.

Exports map (`ecore/package.json`): `.` -> `types: dist/types/index.d.ts`, `require: dist/cjs/index.js`, `import: dist/esm/index.js`.

</details>

## Quickstart

Not applicable: this is a library. There is no `bin` entry, no server, no CLI, no port, no environment variable and no configuration file read. The only OS-level interaction is Node file IO in `ecore/src/FileURIHandler.ts` (`file:` URIs through Node `fs`/`stream`).

<details>
<summary>Details</summary>

Library entry point: `ecore/src/index.ts` re-exports the public API (EObject, EClass, EPackage, EResource, EResourceSet, codecs, ID managers, EStore, ...). All internal imports go through `ecore/src/internal.ts`, a barrel file that controls circular-import order (the generated examples use the same pattern). Usage from a consumer: `npm install @masagroup/ecore`.

</details>

## Interfaces and access methods

No executable is produced by this repository (library, contract, data or tooling): see the build and the dependencies.

## Documentation and guides

- [Architecture](ARCHITECTURE.md): position in the ecosystem, repository layout, internal structure, how it works (diagrams), dependencies.
- [Contributing](CONTRIBUTING.md): development environment, Git and Jira workflow, conventions, CI/CD.
- [Previous README (v1)](README.LEGACY.md): the documentation of the repository before the wiki rewrite.
- [Known issues and open questions](https://claude.ai/artifact/UfvKmky7e8LwEXf192hQjQ#soft.ts): the private artifact that holds them (every page of the wiki).
- Related repositories: [soft](https://github.com/masagroup/soft), [soft.gen](https://github.com/masagroup/soft.gen), [soft.models](https://github.com/masagroup/soft.models), [soft.sync.studio](https://github.com/masagroup/soft.sync.studio), [soft.sync.ts](https://github.com/masagroup/soft.sync.ts), [sw.api.ng.ts](https://github.com/masagroup/sw.api.ng.ts), [sw.webclient](https://github.com/masagroup/sw.webclient).
- Transverse pages: [Build on Windows](https://github.com/masagroup/wiki/wiki/build-windows), [Build on Linux](https://github.com/masagroup/wiki/wiki/build-linux), [CI/CD pipelines](https://github.com/masagroup/wiki/wiki/cicd-pipelines), [Ecosystem today](https://github.com/masagroup/wiki/wiki/ecosystem-current), [Ecosystem next gen](https://github.com/masagroup/wiki/wiki/ecosystem-nextgen), [Glossary](https://github.com/masagroup/wiki/wiki/glossary).
- Repository on GitHub: [masagroup/soft.ts](https://github.com/masagroup/soft.ts).
- The same documentation in the SWORD wiki: [soft.ts](https://github.com/masagroup/wiki/wiki/soft.ts), [architecture](https://github.com/masagroup/wiki/wiki/soft.ts-architecture), [contributing](https://github.com/masagroup/wiki/wiki/soft.ts-contributing), [previous README](https://github.com/masagroup/wiki/wiki/soft.ts-legacy).
