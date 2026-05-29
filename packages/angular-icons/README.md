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

Some icons include an accent layer and support a two-tone (duotone) style.
Override the `--icon-accent-color` [CSS variable](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties) to change only the accent color without affecting the base color.

```css
/* icon.component.css */
.icon {
    --icon-accent-color: red;
}
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
