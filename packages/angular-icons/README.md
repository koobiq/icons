# @koobiq/angular-icons

**A collection of Angular SVG icon components for the web, part of Koobiq Angular.**

Icons are standalone Angular components using an attribute selector (`<svg kbqPlus16 />`). This approach integrates natively with Angular templates, supports tree-shaking, and includes full TypeScript typings.

If you need SVG files or icon font (Koobiq Icons), use the [@koobiq/icons](https://github.com/koobiq/icons) package.

## Showcase

Use the [icon showcase](https://koobiq.io/en/icons) to visually browse the available icons.

## Installation

Depending on your preference, run one of the following in your terminal:

```sh
# With npm
npm install @koobiq/angular-icons

# With yarn
yarn add @koobiq/angular-icons

# With pnpm
pnpm add @koobiq/angular-icons
```

## Usage

Component class names follow the pattern `Kbq{PascalCase}{size}`, used as an attribute selector `kbq{PascalCase}{size}` on an `<svg>` — the icon's kebab-case name (e.g. `plus`, `filter-dot`) converted to PascalCase, with the size suffix (`16`/`24`/`32`/`48`/`64`) appended.

Import the required icon component and add it to your template:

```ts
import { KbqPlus16 } from '@koobiq/angular-icons';

@Component({
    standalone: true,
    imports: [KbqPlus16],
    template: `<svg kbqPlus16></svg>`
})
export class MyComponent {}
```

```ts
// icon.component.ts
import { KbqFilterDot16 } from '@koobiq/angular-icons';

@Component({
    standalone: true,
    imports: [KbqFilterDot16],
    template: `<svg kbqFilterDot16 class="icon"></svg>`
})
export class IconComponent {}
```
