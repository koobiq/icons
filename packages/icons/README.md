# Koobiq Icons

# How to use package

```sh
npm i @koobiq/icons
```

# Publish new version

## Step 1. Prepare and environment

Install dependencies by running:

```sh
yarn install
```

## Step 2. Draw an icon

1. Draw your icon in [Koobiq Icons](https://www.figma.com/design/72HEcN92QnW9IQSXzmIYZX/Koobiq-Icons?m=auto&node-id=1320-21123&t=MZ7yMcUekVdv0doO-1) figma file.
2. Make icons contains the only single outlined and flattened path with name `shape` (second-color path with name `shape-2`).
3. Using a Fill Rule Editor plugin, set shapes' fill rule to Non-zero fill. Make sure icon is rendered correctly.
4. Run flatten for shapes one more time (there is a bug in Figma).

## Step 3. Export icons from figma

Create a file with name `.env` and add there your Figma access token.

To export your icons (SVG) from Figma run the command:

```sh
yarn run figma:sync
```

## Step 4.

Change `mapping.json`:

- Add an entry into `mapping.json` with a new codepoint keys.
- Edit the name of an icon in the `mapping.json` in case of icon rename

Commit SVG files `mapping.json` and push all changes to git.

## Step 5.

Run stage commit script to create a new release tag.

```sh
yarn run stage:commit
```

Use semver for version naming. So increment major (first) version number if any of these changes were made:

- Any icon name was changed (breaking changes for front-end developers)
- Any icon codepoint was changed (breaking changes for tech writers)
- Significant changes in icon metaphor (breaking changes for all)

# SVG Color Zones Guide

## Overview

This guide explains how duotone icons are structured for dynamic styling via CSS,
allowing different parts (zones) to be colored separately using `fill` and `color`.

## How It Works

In the final SVG output:

- **Primary Zone**: No `fill` attribute — inherits the CSS `fill` property.
- **Secondary Zone(s)**: `fill="var(--icon-accent-color, currentColor)"` — driven by the `--icon-accent-color` CSS custom property, falling back to `currentColor`.

CSS styling:

```css
svg {
    fill: #8f99aa; /* Primary zone */
    --icon-accent-color: #00ff00; /* Secondary zone(s) */
}
```

## Figma Conventions

Zones are detected by **Figma layer name**, not by color. This is the contract
between the Figma design file and the build system:

- **Primary Zone**: layer named `shape`.
- **Secondary Zone(s)**: layer named `shape-2`.

Figma is queried with `svg_include_id: true`, so every layer is exported with an
`id` matching its layer name. The build process keys off that `id` to decide which
zone a node belongs to.

> **Note**: previously zones were matched by hardcoded hex colors (`#21222C` /
> `#E21D03`). That binding was dropped because it silently broke every duotone icon
> whenever the Figma palette changed — keying off the layer name keeps the duotone
> mechanism working regardless of the colors used in Figma.

Because color is no longer part of the contract, you don't need specific zone
colors in Figma. Any baked color, inline `style`, and `fill-opacity` are stripped
on export — transparency and color are controlled via CSS in the design system, not
baked into the SVG.

## Implementation

The zone splitting happens during `figma:sync` via the `split-zones` SVGO plugin in
[`.figmaexportrc.mjs`](../../.figmaexportrc.mjs):

- Remove `fill` from the root `<svg>` and from primary-zone nodes.
- Set secondary-zone (`shape-2`) nodes to `fill="var(--icon-accent-color, currentColor)"`.
- Strip baked `style`, `color`, `class`, and `fill-opacity` so color/opacity stay
  CSS-driven.
