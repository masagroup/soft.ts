# soft.ts: contributing

> How to set up a development environment, the Git and Jira workflow and the conventions of `soft.ts`. Back to the [README](README.md) · [Architecture](ARCHITECTURE.md)

## Development environment

The build of the repository is described in the [README](README.md#build); the tooling of the ecosystem is on the transverse pages:

- Linux and Docker Compose: Docker with BuildKit, the GitHub PAT file named by `SECRET_GITHUB_PAT` (`~/.masabot/github.pat`) or the SSH key of `SECRET_GITHUB_SSH` for the private Go modules and npm packages, the profiles `prod`, `test`, `pack` and `dev` (see [Build on Linux](https://github.com/masagroup/wiki/wiki/build-linux)); never push an image, the CI does it.
- Node and yarn: the Node version of the Dockerfile or of `package.json` (`engines`), yarn with the lockfile of the repository, a `%USERPROFILE%\.npmrc` with a `read:packages` PAT for `npm.pkg.github.com` (`@masagroup` scope).
- Editor rules for Claude Code: the shared `claude/` folder of [cicd](https://github.com/masagroup/cicd) installs the same `CLAUDE.md` for every developer (rules, roles, build pages, conventions).

## Git and Jira workflow

- The organisation repository `masagroup/soft.ts` is the reference (CI, releases); work on a fork or on a branch of it, never directly on `master` nor on a release branch (`6.28`...).
- Branch name: `<TICKET>-<short-description>` (for example `SWNG-421-tests-and-fixes`), created from the target branch of the ticket.
- Commit message: `<type>(<scope>): <TICKET-ID>: <imperative description in English>`, with `type` in `feat`, `fix`, `refactor`, `test`, `build`, `ci`, `perf`, `docs`, `chore`; the body says what and why, and the CI impact when there is one. One commit is one coherent change; no `Co-Authored-By` nor other automatic signature.
- Pull request: masabot reads the Jira keys (`SW`, `SWNG`, `IO`, `AI`, `GEFORA`, `COA`) in the title, the branch, the body and the commits, comments the Jira issue and moves it (*In Progress*, *In Review* with `[DONE]`, *In QA* or *In Validation* after the merge). The PR is built rebased on its base branch; the comment commands `/rebase`, `/rebase-all` and `/automerge` are available. See [CI/CD pipelines](https://github.com/masagroup/wiki/wiki/cicd-pipelines).
- Never push to `master` by hand, never create a release or push an image: the CI does it.

## Conventions

- Code, comments, commit messages and file names in English; documentation of the repository in English.
- Formatting of the repository (`clang-format`, `gofmt`/`goimports`, `prettier`/`eslint`) on the lines you touch; no reformatting of a whole file for a one-line change; no dead code, no `TODO` without a ticket; logs at the right level, never a secret.
- TypeScript: Angular with Nx, the `sw.design-system` components before custom ones, yarn with a frozen lockfile, the lint and the tests of the repository, no new `any`, no dependency added without a reason.
- Shared contracts (`.proto`, `.ecore`, OpenAPI, exported Go modules, file formats) are changed with the consumers in mind: grep the workspace, state the compatibility strategy, update the dependants.
- Documentation: this README set (README, ARCHITECTURE, CONTRIBUTING, README.LEGACY) is the source of the [SWORD wiki](https://github.com/masagroup/wiki/wiki/soft.ts); keep the metadata block at the top of the README up to date (the `apps` list feeds the Interfaces section).

## CI/CD

| Workflow | Triggers | What it does |
|---|---|---|
| `.github/workflows/build_and_test.yaml` ("Build and Test") | PR to `master` (opened, synchronize, reopened, ready_for_review), push to `master`, `workflow_dispatch` | ubuntu-latest; setup-node 24.21.0; checkout of the repo into `ts/`; checkout of `masagroup/soft.models` at `f0dd72e4...` into `models/`; runs `sudo env "PATH=$PATH" make ci` in `ts/` |

- This workflow does NOT use the shared [cicd](https://github.com/masagroup/cicd) reusable workflows (outlier versus the convention described in the ecosystem wiki page [CI/CD pipelines](https://github.com/masagroup/wiki/wiki/cicd-pipelines)).
- No publish step: no `npm publish`, no release, no artifact upload, no Docker image. How `@masagroup/ecore` reaches npm is not visible in this repo (UNVERIFIED; "build: set package version to X" commits and `v1.x.y` tags suggest a manual or external publication).
- `make ci` does not call the generator, and the Makefile only stops on a missing `../models` when a generation recipe expands `GENERATOR`: the `soft.models` checkout appears unused by `make ci` (UNVERIFIED whether it is a leftover).
- The README badge references `build_and_test.yaml` in `masagroup/soft.ts`.
