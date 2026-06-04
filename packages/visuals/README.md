# @koobiq/visuals

**A collection of static visual assets (illustrations, error pages) for the web, part of Koobiq.**

Assets are provided as PNG images in two themes — `light` and `dark` — and include `@2x` retina variants.

## Installation

Depending on your preference, run one of the following in your terminal:

```sh
# With npm
npm install @koobiq/visuals

# With yarn
yarn add @koobiq/visuals

# With pnpm
pnpm add @koobiq/visuals
```

## Usage

Reference assets directly from the package by theme and filename:

```ts
import errorLight from '@koobiq/visuals/light/404_256.png';
import errorDark from '@koobiq/visuals/dark/404_256.png';
```

Or in CSS:

```css
.error-illustration {
    background-image: url('@koobiq/visuals/light/404_256.png');
}

@media (prefers-color-scheme: dark) {
    .error-illustration {
        background-image: url('@koobiq/visuals/dark/404_256.png');
    }
}
```

### Available sizes

Each illustration is available in the following sizes: `192`, `256`. Retina (`@2x`) variants are included for all sizes.
