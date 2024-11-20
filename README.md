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
