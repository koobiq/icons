# Koobiq Icons

Icon packages for the [Koobiq](https://koobiq.io) design system.

## Packages

| Package                                           | Description                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| [`@koobiq/icons`](packages/icons)                 | SVG source files, icon font (TTF/WOFF), SVG sprite, and TypeScript types |
| [`@koobiq/angular-icons`](packages/angular-icons) | Angular standalone SVG icon components                                   |
| [`@koobiq/react-icons`](packages/react-icons)     | React SVG icon components                                                |
| [`@koobiq/visuals`](packages/visuals)             | Static illustrations and error page images (light/dark)                  |

## Development

**Prerequisites:** Node.js 20+, Yarn 4

```sh
yarn install
```

Build all packages:

```sh
yarn nx run-many -t build
```

Sync icons from Figma (requires `FIGMA_TOKEN` env variable):

```sh
yarn nx run @koobiq/icons:figma:sync
```

## License

MIT © [Koobiq Team](https://koobiq.io)
