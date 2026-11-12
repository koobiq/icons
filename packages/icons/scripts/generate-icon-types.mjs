import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, '../../..');
const OUTPUT_DIR = join(WORKSPACE_ROOT, 'dist/packages/icons/types');
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
    const deprecatedNames = sortByName(Object.keys(interop));

    if (iconNames.length === 0) {
        throw new Error(`No icon names found in ${MAPPING_FILE}`);
    }

    await mkdir(OUTPUT_DIR, { recursive: true });

    const dts = [
        HEADER,
        '/** All current icon names. */',
        `export type KbqIconName =`,
        ...iconNames.map((name) => `    | ${quote(name)}`),
        '',
        '/** Backwards-compatible icon aliases.',
        ' * @deprecated Use `KbqIconName` instead.',
        ' */',
        `export type KbqDeprecatedIconName =`,
        ...deprecatedNames.map((name) => `    | ${quote(name)}`),
        '',
        '/** Runtime map of all current icon names. */',
        `export declare const KBQ_ICON_NAMES: {`,
        ...iconNames.map((name) => `    readonly ${quote(name)}: ${quote(name)};`),
        '};',
        '',
        '/** Runtime map of backwards-compatible icon aliases.',
        ' * @deprecated Use `KBQ_ICON_NAMES` instead.',
        ' */',
        `export declare const KBQ_DEPRECATED_ICON_NAMES: {`,
        ...deprecatedNames.map((name) => `    readonly ${quote(name)}: ${quote(name)};`),
        '};',
        ''
    ].join('\n');

    const js = [
        HEADER,
        "'use strict';",
        '',
        '/** All current icon names. */',
        'const KBQ_ICON_NAMES = {',
        ...iconNames.map((name) => `    ${quote(name)}: ${quote(name)},`),
        '};',
        '',
        '/** Backwards-compatible icon aliases.',
        ' * @deprecated Use `KBQ_ICON_NAMES` instead.',
        ' */',
        'const KBQ_DEPRECATED_ICON_NAMES = {',
        ...deprecatedNames.map((name) => `    ${quote(name)}: ${quote(name)},`),
        '};',
        '',
        'module.exports = {',
        '    KBQ_ICON_NAMES,',
        '    KBQ_DEPRECATED_ICON_NAMES',
        '};',
        ''
    ].join('\n');

    await writeFile(join(OUTPUT_DIR, 'icon-name.d.ts'), dts, 'utf8');
    await writeFile(join(OUTPUT_DIR, 'icon-name.js'), js, 'utf8');

    console.log(`✅ Generated icon-name types (${iconNames.length} icons + ${deprecatedNames.length} aliases)`);
}

main().catch((err) => {
    console.error('❌ Failed to generate icon name types:', err);
    process.exit(1);
});
