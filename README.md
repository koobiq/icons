# Koobiq Icons

# How to use package

```
npm i @koobiq/icons
```

# Publish new version

## Step 1. Prepare and environment

Install dependencies by running:

```
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

```
yarn run figma:sync
```

## Step 4.

Change `mapping.json`:

-   Add an entry into `mapping.json` with a new codepoint keys.
-   Edit the name of an icon in the `mapping.json` in case of icon rename

Commit SVG files `mapping.json` and push all changes to git.

## Step 5.

Run stage commit script to create a new release tag.

```
yarn run stage:commit
```

Use semver for version naming. So increment major (first) version number if any of these changes were made:

-   Any icon name was changed (breaking changes for front-end developers)
-   Any icon codepoint was changed (breaking changes for tech writers)
-   Significant changes in icon metaphor (breaking changes for all)

# SVG Color Zones Guide

## Overview

This guide explains how to structure SVGs for dynamic styling via CSS, allowing different parts to be colored separately using `fill` and `color`.

## How It Works

-   **Primary Zone**: No `fill` attribute.
-   **Secondary Zone(s)**: `fill="currentColor"`.

CSS styling:

```css
svg {
    fill: #8f99aa; /* Primary zone */
    color: #00ff00; /* Secondary zone(s) */
}
```

For details, see [CSS-Tricks](https://css-tricks.com/lodge/svg/21-get-two-colors-use/).

## Figma Conventions

To facilitate automated processing during the build phase, we follow these conventions in Figma:

-   **Primary Zone**: `#21222C` (black).
-   **Secondary Zone(s)**: `#E21D03` (red).

These colors serve as a contract between the Figma design file and the build system.
The build process recognizes these colors and applies the appropriate transformations to ensure the correct fill behavior in the final SVG output.

## Implementation

-   Remove `fill` from the primary zone.
-   Set secondary zones to `fill="currentColor"`.
-   Use CSS for styling.
