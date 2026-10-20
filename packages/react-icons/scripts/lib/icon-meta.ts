export const SIZES = ['16', '24', '32', '48', '64'] as const;

export type IconSize = (typeof SIZES)[number];

export type IconMeta = {
    key: string;
    baseName: string;
    size?: IconSize;
    name: string;
};

export type LegacyIconMeta = IconMeta & { newKey: string };

export function pascalCase(input: string): string {
    if (!input) return '';

    const tokens = input
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+/g)
        .filter(Boolean);

    return tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join('');
}

export function parseIconKey(key: string): IconMeta {
    const [baseName = '', rawSize] = key.split('_');

    const size = SIZES.includes(rawSize as IconSize) ? (rawSize as IconSize) : undefined;

    const name = `Icon${pascalCase(baseName)}${size || ''}`;

    return { key, baseName, size, name };
}

export function compareBySizeAndName(a: { size?: IconSize; name: string }, b: { size?: IconSize; name: string }) {
    const sa = Number(a.size ?? 0);
    const sb = Number(b.size ?? 0);

    return sa === sb ? a.name.localeCompare(b.name) : sa - sb;
}

/** Legacy aliases: mapping-interop entries whose old name still carries a size suffix (eg. "node-tree_16": "node-tree" is a font-only alias and is skipped). */
export function getLegacyMetas(interop: Record<string, string>): LegacyIconMeta[] {
    return Object.entries(interop)
        .filter(([, oldName]) => SIZES.some((size) => oldName.endsWith(`_${size}`)))
        .map(([newKey, oldName]) => ({ newKey, ...parseIconKey(oldName) }))
        .sort((a, b) => a.name.localeCompare(b.name));
}
