import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WORKSPACE_ROOT = join(__dirname, '../../..');
const MAPPING_PATH = './mapping.json';
const INTEROP_PATH = './mapping-interop.json';

const SIZES = ['16', '24', '32', '48', '64'];

function pascalCase(input) {
    if (!input) return '';

    const tokens = input
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+/g)
        .filter(Boolean);

    return tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join('');
}

function parseIconKey(key) {
    const [baseName = '', rawSize] = key.split('_');

    const size = SIZES.includes(rawSize) ? rawSize : undefined;

    return { baseName, size };
}

// mapping-interop.json maps each current icon key (matches mapping.json) to a deprecated old key kept
// resolvable for backward compatibility (see fantasticicon-utils.js, which assigns the old name the same
// font codepoint as the current one). Here we only care about the base-name renames, so agents that
// encounter an old name in existing code know which current icon to use instead.
function buildAliasMap(interopMapping) {
    const aliasesByBaseName = Object.create(null);

    for (const [currentKey, deprecatedKey] of Object.entries(interopMapping)) {
        const { baseName: currentBaseName } = parseIconKey(currentKey);
        const { baseName: deprecatedBaseName } = parseIconKey(deprecatedKey);

        if (!currentBaseName || !deprecatedBaseName || currentBaseName === deprecatedBaseName) continue;

        if (!aliasesByBaseName[currentBaseName]) aliasesByBaseName[currentBaseName] = [];
        if (!aliasesByBaseName[currentBaseName].includes(deprecatedBaseName)) {
            aliasesByBaseName[currentBaseName].push(deprecatedBaseName);
        }
    }

    return aliasesByBaseName;
}

export function buildLlmsFiles(mapping, interopMapping = {}) {
    const aliasesByBaseName = buildAliasMap(interopMapping);
    const icons = Object.create(null);

    for (const [key, data] of Object.entries(mapping)) {
        const { baseName, size } = parseIconKey(key);

        if (!baseName) continue;

        let icon = icons[baseName];

        if (!icon) {
            icon = { sizes: [], tags: [] };
            icons[baseName] = icon;
        }

        if (size && !icon.sizes.includes(size)) icon.sizes.push(size);

        for (const tag of data?.tags ?? []) {
            if (tag && !icon.tags.includes(tag)) icon.tags.push(tag);
        }
    }

    const sortedNames = Object.keys(icons).sort((a, b) => a.localeCompare(b));

    const lines = sortedNames.map((name) => {
        const icon = icons[name];
        const sizes = SIZES.filter((size) => icon.sizes.includes(size));
        // Cyrillic tags sort after Latin ones under localeCompare (Unicode block order) — deterministic, not a bug.
        const tags = icon.tags.slice().sort((a, b) => a.localeCompare(b));
        const pascal = pascalCase(name);
        const firstSize = sizes[0] ?? '';

        const sizesStr = sizes.length ? sizes.join(', ') : '—';
        const tagsStr = tags.length ? tags.join(', ') : '—';
        const reactImport = `import { Icon${pascal}${firstSize} } from '@koobiq/react-icons'`;
        const angularImport = `import { Kbq${pascal}${firstSize} } from '@koobiq/angular-icons' (selector: kbq${pascal}${firstSize})`;

        let line = `${name} | sizes: ${sizesStr} | tags: ${tagsStr} | react: ${reactImport} | angular: ${angularImport}`;

        const aliases = (aliasesByBaseName[name] ?? []).slice().sort((a, b) => a.localeCompare(b));

        if (aliases.length) {
            line += ` | deprecated-aliases: ${aliases.join(', ')} (renamed — do not use, replace with "${name}")`;
        }

        return line;
    });

    const llmsFullTxt = `# Koobiq Icons — Full Reference

Auto-generated from mapping.json by packages/icons/scripts/generate-llms-txt.mjs — do not hand-edit.

Format: <name> | sizes: <sizes> | tags: <tags> | react: <import> | angular: <import> | deprecated-aliases: <old names, if renamed>

${lines.join('\n')}
`;

    const llmsTxt = `# Koobiq Icons

> Icon packages (SVG source, icon font, Angular/React components) for the Koobiq design system.

## Docs
- [llms-full.txt](https://github.com/koobiq/icons/blob/main/llms-full.txt) — every icon name, sizes, tags, and import examples
- [Repo conventions](https://github.com/koobiq/icons/blob/main/AGENTS.md) — package structure, build pipeline, naming conventions
- [SVG color-zones guide](https://github.com/koobiq/icons/blob/main/packages/icons/README.md) — duotone icon usage

## Packages
- \`@koobiq/icons\` — SVG source, icon font, SVG sprite, TS types
- \`@koobiq/angular-icons\` — Angular standalone components
- \`@koobiq/react-icons\` — React components
- \`@koobiq/visuals\` — static illustrations

## Icon naming
Icon keys are \`{name}_{size}\`, size ∈ 16/24/32/48/64 (not every icon has every size).
React component: \`Icon{PascalCase}{size}\`. Angular class: \`Kbq{PascalCase}{size}\`, selector: \`kbq{PascalCase}{size}\`.
Some icons were renamed; if you see an unfamiliar name in existing code, check \`deprecated-aliases\` in llms-full.txt — it's an old name and should be replaced with the current one shown there.
`;

    return { llmsTxt, llmsFullTxt };
}

async function main() {
    const outArg = process.argv.find((arg) => arg.startsWith('--out='));
    const outDir = outArg ? outArg.slice('--out='.length) : WORKSPACE_ROOT;

    const mappingJSON = JSON.parse(await readFile(MAPPING_PATH, { encoding: 'utf-8' }));
    // eslint-disable-next-line no-unused-vars
    const { $schema, ...mapping } = mappingJSON;
    const interopMapping = JSON.parse(await readFile(INTEROP_PATH, { encoding: 'utf-8' }));

    const { llmsTxt, llmsFullTxt } = buildLlmsFiles(mapping, interopMapping);

    await writeFile(join(outDir, 'llms.txt'), llmsTxt);
    await writeFile(join(outDir, 'llms-full.txt'), llmsFullTxt);

    console.log(`✅ Generated llms.txt and llms-full.txt in ${outDir}`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
    main().catch((err) => {
        console.error('❌ Error generating llms.txt:', err);
        process.exit(1);
    });
}
