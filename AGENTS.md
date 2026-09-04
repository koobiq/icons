# Koobiq Icons Monorepo — Agent Guide

> Context for AI agents working with Koobiq Icons Monorepo.

## Overview

NX monorepo (Yarn 4 workspaces) for the Koobiq design system icon packages. Publishable packages, all built into `dist/packages/` at the workspace root.

## Package structure

```
packages/
  icons/          @koobiq/icons          — SVG source files, icon font, SVG sprite, type definitions
  angular-icons/  @koobiq/angular-icons  — Angular standalone components generated from SVGs
  react-icons/    @koobiq/react-icons    — React components generated from SVGs (Vite build)
  visuals/        @koobiq/visuals        — Static PNG illustrations (light/dark themes)

dist/packages/
  icons/          publishable dist for @koobiq/icons
  angular-icons/  publishable dist for @koobiq/angular-icons
  react-icons/    publishable dist for @koobiq/react-icons
  visuals/        publishable dist for @koobiq/visuals
```

## Workspace root files

| File                   | Purpose                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `mapping.json`         | Maps SVG filenames to icon names/codepoints — source of truth for all packages |
| `mapping-interop.json` | Interop aliases for backwards-compatible icon name mapping                     |
| `schema.json`          | JSON schema for `mapping.json`; used to generate TypeScript types              |
| `config.mjs`           | Shared workspace config (e.g. Figma export paths)                              |
| `nx.json`              | NX workspace config: target defaults, caching, release groups                  |
| `.eslintrc.js`         | Root ESLint config (base); each package extends it                             |
| `.lintstagedrc.js`     | lint-staged: prettier on all files, `nx affected -t lint --fix` on TS/JS       |

## Dependency pipeline

```
packages/icons/svg/          ← source SVGs (populated by figma:sync)
        ↓
  @koobiq/icons:build        → dist/packages/icons/
        ↓
  angular-icons:generate     → packages/angular-icons/icons/  (Angular components)
  react-icons:generate       → packages/react-icons/src/      (React components)
        ↓
  angular-icons:build        → dist/packages/angular-icons/
  react-icons:build          → dist/packages/react-icons/
        ↓
  *:nx-release-publish       → npm publish from dist/packages/{name}/
```

`@koobiq/visuals` is independent — no dependency on other packages.

## NX targets (per package)

| Target               | What it does                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `figma:export-icons` | Exports SVGs from Figma via `.figmaexportrc.mjs` (icons only, no cache)                                                     |
| `figma:sync`         | Copies exported SVGs from `temp/svg` into `packages/icons/svg/` (no cache)                                                  |
| `build:sprite`       | Generates SVG symbol sprite → `dist/packages/icons/symbol/`                                                                 |
| `build:fonts`        | Generates icon font (TTF/WOFF) + CSS/SCSS → `dist/packages/icons/fonts/` (no cache — font timestamps are non-deterministic) |
| `build:types`        | Generates TS type definitions from `schema.json` → `dist/packages/icons/types/`                                             |
| `generate`           | Generates Angular/React components from SVGs in `packages/icons/svg/`                                                       |
| `build`              | Compiles/bundles the package (ng-packagr for Angular, Vite+tsc for React); copies LICENSE, README, package.json into dist   |
| `lint`               | ESLint with package-specific config                                                                                         |
| `nx-release-publish` | Publishes from `dist/packages/{name}/` to npm                                                                               |

## Common commands

```sh
# Build everything
yarn nx run-many -t build

# Build a single package
yarn nx run @koobiq/react-icons:build

# Run full publish pipeline for one package (build → prepublish → publish)
yarn nx run @koobiq/react-icons:nx-release-publish

# Figma sync (exports SVGs from Figma, then copies to packages/icons/svg/)
yarn nx run @koobiq/icons:figma:sync

# Lint all
yarn nx run-many -t lint

# Release (version bump + changelog + GitHub Release; publish happens in CI, see below)
yarn release

# Release dry run
yarn release:preview
```

## ESLint setup

- Root `.eslintrc.js` — base config (eslint:recommended + prettier), used by `@koobiq/icons`
- `packages/angular-icons/.eslintrc.js` — extends root, adds `@angular-eslint` and `@typescript-eslint`
- `packages/react-icons/.eslintrc.cjs` — extends root, adds `eslint-plugin-react`, `react-hooks`, `@typescript-eslint`
- Generated files are excluded via `.eslintignore` and per-package `ignorePatterns`

## NX release config

Single fixed release group in `nx.json` covering all four packages (`@koobiq/icons`, `@koobiq/angular-icons`, `@koobiq/react-icons`, `@koobiq/visuals`) — one shared version, one root `CHANGELOG.md`, tag pattern: `{version}` (e.g. `12.1.1`).

Version bumps follow conventional commits: `feat` → minor, `fix` → patch, `BREAKING CHANGE` → major.

### Releasing

`yarn release` (`nx release --skip-publish`) bumps the version, generates the changelog, commits, tags, and creates a GitHub Release — requires GitHub auth on the machine running it.

The tag push is what triggers `publish.yml` to run `nx release publish` in CI.

Do not run `nx release publish` manually.

```sh
# NX infers the version bump from conventional commits since the last tag.
# Use --specifier to force an exact version (e.g. for a planned major bump).
nx release version [--specifier 12.2.0]
nx release changelog
```

Always dry-run first: `yarn release:preview`.

## Key conventions

- `packages/icons/svg/` is the single source of truth for SVGs — do not edit files there manually; they are managed by `figma:sync`
- `mapping.json` must be updated when icons are added/removed; run `yarn check-mapping` to validate
- After adding, updating, or removing an icon, run `yarn generate:llms` to regenerate `llms.txt`/`llms-full.txt` — CI fails (`yarn check-llms`) if they're stale
- Angular component class names: `Kbq{PascalCase}` — selector: `kbq{PascalCase}` (attribute on `<svg>`)
- React component names: `Icon{PascalCase}{Size}` — exported as named exports from the package index
