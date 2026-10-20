/** plus_16 → plus-16 */
export function toKebab(name: string): string {
    return name.replace(/_/g, '-');
}

/** plus-16 → Plus16 */
export function toPascalCase(kebab: string): string {
    return kebab
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
