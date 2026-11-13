# Contributing to Koobiq Icons

Thank you for helping improve Koobiq Icons. This repository holds the icon packages of the Koobiq design system: the SVG sources with the icon font and sprite, the Angular and React components generated from them, and the `@koobiq/visuals` illustrations. This guide explains how to propose an icon, set up the repository and get a pull request merged.

Contributions are accepted under the [MIT License](LICENSE).

## Questions, bugs and ideas

- Ask questions in the [Telegram chat](https://t.me/koobiq_io), not in issues.
- Report a bug in an [issue](https://github.com/koobiq/icons/issues/new): a wrong icon, a missing glyph in the font, a problem with a component. Add the package name and version. Search the existing issues first.
- Request a new icon or a change to an existing one in an issue too: describe what the icon means, the sizes you need and where it will be used. The Koobiq team draws icons in Figma and exports them into this repository, so do not send an SVG in a pull request.
- Send a small change straight as a pull request: a fix in a build or generation script, the CI or the docs.
- Discuss a large change in an issue before writing code: a new output format or a change to the generated components. Renaming or removing an icon, changing its codepoint or its metaphor are breaking changes and wait for the next major release.
- Report a vulnerability privately with **Report a vulnerability** on the [Security tab](https://github.com/koobiq/icons/security), never in a public issue.

## Setup

- Use the Node.js version from [`.nvmrc`](.nvmrc) and the Yarn version checked into the repository (`packageManager` in `package.json`).
- Install the dependencies: `yarn install`. It also enables the git hooks: before each commit they format the staged files with Prettier, run ESLint with `--fix` in the packages whose JS or TS files are staged, and validate the commit message. If the hooks do not run, enable them with `yarn husky`.
- Build all packages into `dist/packages/`: `yarn run build`.

The package layout, the build pipeline and the Nx targets are described in [AGENTS.md](AGENTS.md), the packages themselves in the [README](README.md).

## Making a change

1. Fork the repository, or push a branch to it if you have write access.
2. Create a branch from `main`.
3. Make the change. The Koobiq team changes an icon in Figma:
    - Draw it in the Figma file whose id is `figmaFile.id` in [`config.mjs`](config.mjs), on the page of its size: `16`, `24`, `32`, `48` or `64`.
    - Keep each color zone a single outlined and flattened path: `shape` for the main zone, `shape-2` for the accent one. The export finds the [zones by these layer names](packages/icons/README.md#figma-conventions). Set the fill rule of the paths to non-zero, for example with the Fill Rule Editor plugin, check that the icon renders correctly and flatten the paths once more: Figma has a bug here.
    - Name the component `{name}_{size}`. It becomes the SVG file name, and the component names in the packages are derived from it, see [Icon naming](README.md#icon-naming). Components whose names start with `.` or `_` are not exported.
    - Export the icons: `yarn figma:sync`. It needs a Figma access token that can read the file, in `.env` (see [`.env.example`](.env.example)). The command first runs `yarn clean` (`yarn cache clean`, `nx reset`, deleting `temp/` and `dist/`), then exports every component of the file and replaces `packages/icons/svg/` with the result. Check `git status`: the export also picks up other icons changed in Figma.
    - Add every new SVG to [`mapping.json`](mapping.json): the key is the file name without `.svg`, `codepoint` is the next one after the highest in the file, `tags` are search words in English and Russian. Never change or reuse an existing codepoint.
    - To rename an icon, rename the component in Figma and its key in `mapping.json`, keeping the codepoint, and add `"<new name>": "<old name>"` to [`mapping-interop.json`](mapping-interop.json): the font and the React package keep the old name as a deprecated alias.
    - Run `yarn check-mapping`: it checks that every SVG file has an entry and every entry has a file and a valid codepoint that no other entry uses.

    The illustrations of `@koobiq/visuals` are PNG files in `packages/visuals/light` and `packages/visuals/dark`. The build converts them to WebP.

    Do not edit by hand:
    - `packages/icons/svg/`: the next `yarn figma:sync` overwrites it;
    - the Angular and React components: the build generates them from the SVGs, and they are not committed;
    - `CHANGELOG.md`, the package versions, `llms.txt` and `llms-full.txt`: they are updated with each release.

4. Run the checks CI runs:

    ```bash
    yarn run build          # All packages; also checks the generated components against the SVGs
    yarn run prettier       # Formatting
    yarn run lint           # ESLint in every package
    yarn run check-mapping  # mapping.json matches packages/icons/svg/, codepoints are unique
    ```

5. Open a pull request against `main`. Older major versions are patched in their own branches (`10.10.x`, `v11.7.x`): if a fix is needed there too, say so in the description.

## Commit messages and pull request titles

commitlint checks the commit message in the `commit-msg` hook and the pull request title in CI. The [commitlint config](.commitlintrc.js) uses the rules of `@commitlint/config-conventional` and limits the scopes.

```
<type>(<scope>): <subject>
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` or `revert`.
- **scope** (optional): only `deps` and `deps-dev`, which Dependabot uses, and `release` for the release commit. Other changes go without a scope.
- **subject**: in the imperative mood, starting with a lowercase letter, with no period at the end.
- The header is at most 100 characters. Lines of the body and footer are at most 100 characters.
- Team members put the task reference at the end of the subject: `(#DS-1234)`. Link a GitHub issue in the pull request description with `Closes #123`.
- Mark a breaking change with `!` before the colon: `feat!: ...`. Put it in the pull request title: the squash commit gets no body, so a `BREAKING CHANGE:` note in the description never reaches `main`.

Examples:

```
feat: add git icons (#DS-5765)
fix: align time-messenger-alt keywords (#DS-5765)
feat!: rename windows-arrow-rotate-left_24 to arrow-rotate-left-badge-windows_24
```

Pull requests are squash-merged, and the pull request title becomes the commit message in `main`. The release is built from these titles: `feat` bumps the minor version, `fix` the patch version and `!` the major one. The changelog lists `feat`, `fix` and `perf`.

## Pull requests

- Fill in the [pull request template](.github/pull_request_template.md): a summary, the notable changes and what reviewers should focus on.
- For an icon change, link the Figma node of every added or changed icon, so reviewers can compare the SVGs with the source.
- Keep one change per pull request: it becomes one commit in `main`.
- Open unfinished work as a [draft](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests) and mark it **Ready for review** when it is done.
- Maintainers get a notification when a pull request is opened.
- Keep the branch up to date with `main`: a pull request with conflicts gets no CI runs.

## Ready to merge

A maintainer squash-merges the pull request when:

- CI is green, including the commitlint check of the title;
- a maintainer has approved it and the review threads are resolved;
- it has no conflicts with `main`.

A branch of this repository is deleted automatically after the merge; a branch in a fork is not. The change reaches npm with the next release: a maintainer runs `yarn release`, and CI publishes all four packages with one shared version.
