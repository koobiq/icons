# Koobiq Icons

Icon packages for the [Koobiq](https://koobiq.io) design system.

## Packages

| Package                                           | Description                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`@koobiq/icons`](packages/icons)                 | SVG source files, icon font (WOFF2, WOFF, TTF), SVG sprite, and TypeScript types |
| [`@koobiq/angular-icons`](packages/angular-icons) | Angular standalone SVG icon components                                           |
| [`@koobiq/react-icons`](packages/react-icons)     | React SVG icon components                                                        |
| [`@koobiq/visuals`](packages/visuals)             | Static illustrations and error page images (light/dark)                          |

## Development

**Prerequisites:** Node.js from [`.nvmrc`](.nvmrc), Yarn 4

```sh
yarn install
```

Build all packages:

```sh
yarn nx run-many -t build
```

Sync icons from Figma (requires `FIGMA_TOKEN`, see [`.env.example`](.env.example)):

```sh
yarn figma:sync
```

How to request an icon, the commit rules and the pull request process are described in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [Koobiq Team](https://koobiq.io)

## Icon naming

Icon keys are `{name}_{size}`, size ∈ 16/24/32/48/64 (not every icon has every size).
