import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, '../../..');
const OUTPUT_DIR = join(WORKSPACE_ROOT, 'dist/packages/icons/icon-names');
const MAPPING_FILE = join(WORKSPACE_ROOT, 'mapping.json');
const INTEROP_FILE = join(WORKSPACE_ROOT, 'mapping-interop.json');

const HEADER = '// This file is auto-generated. Do not edit it manually.\n';

function sortByName(values) {
    return [...values].sort((a, b) => a.localeCompare(b));
}

function quote(value) {
    return `'${value.replace(/'/g, "\\'")}'`;
}

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}

async function main() {
    const mapping = await readJson(MAPPING_FILE);
    const interop = await readJson(INTEROP_FILE);

    const iconNames = sortByName(Object.keys(mapping).filter((key) => key !== '$schema'));
    const deprecatedNames = sortByName(Object.values(interop));

    if (iconNames.length === 0) {
        throw new Error(`No icon names found in ${MAPPING_FILE}`);
    }

    await mkdir(OUTPUT_DIR, { recursive: true });

    // Remove stale files from the previous output location.
    await rm(join(WORKSPACE_ROOT, 'dist/packages/icons/types/icon-name.d.ts'), { force: true });
    await rm(join(WORKSPACE_ROOT, 'dist/packages/icons/types/icon-name.js'), { force: true });

    const dts = [
        HEADER,
        '/** All current icon names. */',
        'export declare const KBQ_ICON_NAMES: {',
        ...iconNames.map((name) => `    readonly ${quote(name)}: ${quote(name)};`),
        '};',
        '',
        '/** All current icon names. */',
        'export type KbqIconName = keyof typeof KBQ_ICON_NAMES;',
        '',
        '/** Backwards-compatible icon aliases.',
        ' * @deprecated Use `KbqIconName` instead.',
        ' */',
        'export declare const KBQ_DEPRECATED_ICON_NAMES: {',
        ...deprecatedNames.map((name) => `    readonly ${quote(name)}: ${quote(name)};`),
        '};',
        '',
        '/** Backwards-compatible icon aliases.',
        ' * @deprecated Use `KbqIconName` instead.',
        ' */',
        'export type KbqDeprecatedIconName = keyof typeof KBQ_DEPRECATED_ICON_NAMES;',
        ''
    ].join('\n');

    const mjs = [
        HEADER,
        '/** All current icon names. */',
        'export const KBQ_ICON_NAMES = {',
        ...iconNames.map((name) => `    ${quote(name)}: ${quote(name)},`),
        '};',
        '',
        '/** Backwards-compatible icon aliases.',
        ' * @deprecated Use `KBQ_ICON_NAMES` instead.',
        ' */',
        'export const KBQ_DEPRECATED_ICON_NAMES = {',
        ...deprecatedNames.map((name) => `    ${quote(name)}: ${quote(name)},`),
        '};',
        ''
    ].join('\n');

    await writeFile(join(OUTPUT_DIR, 'icon-name.d.ts'), dts, 'utf8');
    await writeFile(join(OUTPUT_DIR, 'icon-name.mjs'), mjs, 'utf8');

    console.log(`✅ Generated icon-name types (${iconNames.length} icons + ${deprecatedNames.length} aliases)`);
}

main().catch((err) => {
    console.error('❌ Failed to generate icon name types:', err);
    process.exit(1);
});
