# Koobiq Icons

# How to use package

```sh
npm i @koobiq/icons
```

# Adding or changing an icon

Icons are drawn in Figma and exported into the [koobiq/icons](https://github.com/koobiq/icons) repository. How to request an icon, how the export works and how a change gets released are described in [CONTRIBUTING.md](https://github.com/koobiq/icons/blob/main/CONTRIBUTING.md).

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
