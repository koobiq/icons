import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, '../../..');
const TYPES_OUTPUT_DIR = join(WORKSPACE_ROOT, 'dist/packages/icons/types');
const MAPPING_FILE = join(WORKSPACE_ROOT, 'mapping.json');
const INTEROP_FILE = join(WORKSPACE_ROOT, 'mapping-interop.json');

const HEADER = '// This file is auto-generated. Do not edit it manually.\n';

function sortByName(values) {
    return [...values].sort((a, b) => a.localeCompare(b));
}

function quote(value) {
    return `'${value.replace(/'/g, "\\'")}'`;
}

function toPascalCase(name) {
    const sizeMatch = name.match(/_(\d+)$/);
    const size = sizeMatch ? sizeMatch[1] : '';
    const base = sizeMatch ? name.slice(0, -sizeMatch[0].length) : name;

    const pascal = base
        .split(/[_-]+/)
        .map((part) => (part.length ? part[0].toUpperCase() + part.slice(1).toLowerCase() : ''))
        .join('');

    const result = pascal + size;
    return /^\d/.test(result) ? `I${result}` : result;
}

function dtsPropertyLine(pascalName, value, deprecatedToPreference) {
    const preference = deprecatedToPreference[pascalName];
    if (preference) {
        return `    /** @deprecated Use \`${preference}\` instead. */\n    readonly ${pascalName}: ${quote(value)};`;
    }
    return `    readonly ${pascalName}: ${quote(value)};`;
}

function mjsPropertyLine(pascalName, value, deprecatedToPreference) {
    const preference = deprecatedToPreference[pascalName];
    if (preference) {
        return `    /** @deprecated Use \`${preference}\` instead. */\n    ${pascalName}: ${quote(value)},`;
    }
    return `    ${pascalName}: ${quote(value)},`;
}

const CONSTANT_NAME = 'KbqIconNames';

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

    const pascalNameByName = {};
    const nameByPascalName = {};
    for (const name of [...iconNames, ...deprecatedNames]) {
        const pascalName = toPascalCase(name);
        if (nameByPascalName[pascalName]) {
            throw new Error(
                `PascalCase name collision: both "${name}" and "${nameByPascalName[pascalName]}" map to "${pascalName}"`
            );
        }
        pascalNameByName[name] = pascalName;
        nameByPascalName[pascalName] = name;
    }

    const deprecatedToPreference = {};
    for (const [preference, deprecated] of Object.entries(interop)) {
        deprecatedToPreference[pascalNameByName[deprecated]] = pascalNameByName[preference];
    }

    const allNamesSet = {};
    for (const name of iconNames) {
        allNamesSet[name] = true;
    }
    for (const name of deprecatedNames) {
        allNamesSet[name] = true;
    }
    const allNames = sortByName(Object.keys(allNamesSet)).map((name) => ({
        name,
        pascalName: pascalNameByName[name]
    }));

    await mkdir(TYPES_OUTPUT_DIR, { recursive: true });

    // Remove stale files from earlier iterations.
    await rm(join(TYPES_OUTPUT_DIR, 'icon-name.d.ts'), { force: true });
    await rm(join(TYPES_OUTPUT_DIR, 'icon-name.js'), { force: true });
    await rm(join(TYPES_OUTPUT_DIR, 'icon-name.d.mts'), { force: true });
    await rm(join(TYPES_OUTPUT_DIR, '..', 'icon-names'), { force: true, recursive: true });

    const namesDts = [
        HEADER,
        '/** All current icon names. */',
        `export declare const ${CONSTANT_NAME}: {`,
        ...allNames.map(({ name, pascalName }) => dtsPropertyLine(pascalName, name, deprecatedToPreference)),
        '};',
        '',
        '/** All current icon names. */',
        `export type KbqIconName = (typeof ${CONSTANT_NAME})[keyof typeof ${CONSTANT_NAME}];`,
        '',
        '/** Deprecated icon name aliases. */',
        'export type KbqDeprecatedIconName =',
        ...deprecatedNames.map((name) => `    | ${quote(pascalNameByName[name])}`),
        ''
    ].join('\n');

    const namesMjs = [
        HEADER,
        '/** All current icon names. */',
        `export const ${CONSTANT_NAME} = {`,
        ...allNames.map(({ name, pascalName }) => mjsPropertyLine(pascalName, name, deprecatedToPreference)),
        '};',
        ''
    ].join('\n');

    await writeFile(join(TYPES_OUTPUT_DIR, 'names.d.ts'), namesDts, 'utf8');
    await writeFile(join(TYPES_OUTPUT_DIR, 'names.mjs'), namesMjs, 'utf8');

    console.log(`✅ Generated icon name types (${iconNames.length} current + ${deprecatedNames.length} aliases)`);
}

main().catch((err) => {
    console.error('❌ Failed to generate icon name types:', err);
    process.exit(1);
});
