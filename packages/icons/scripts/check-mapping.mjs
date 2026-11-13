import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import { parse } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAPPING_PATH = './mapping.json';
const SVG_DIR = join(__dirname, '../svg');

async function main() {
    const mappingJSON = JSON.parse(await readFile(MAPPING_PATH, { encoding: 'utf-8' }));
    // eslint-disable-next-line no-unused-vars
    const { $schema, ...mapping } = mappingJSON;
    const svgFileList = (await readdir(SVG_DIR))
        .map((file) => parse(file))
        .filter(({ ext }) => ext === '.svg')
        .map(({ name }) => name);
    const svgListInMapping = Object.keys(mapping).sort();

    if (process.argv.includes('--list')) {
        console.log(svgListInMapping.join('\n'));
        return;
    }

    const missingFromMapping = svgFileList.filter((svg) => !mapping[svg]);
    const missingFromFiles = svgListInMapping.filter((svg) => !svgFileList.includes(svg));

    // The font maps a codepoint to a single glyph. Codepoints are compared as numbers, the way the
    // font build parses them, so `0xF501` and `0xf501` count as the same one.
    const iconsByCodepoint = {};
    const invalidCodepoints = [];
    for (const [icon, { codepoint }] of Object.entries(mapping)) {
        const code = parseInt(codepoint);
        if (Number.isNaN(code)) {
            invalidCodepoints.push(icon);
        } else {
            (iconsByCodepoint[code] ??= []).push(icon);
        }
    }
    const sharedCodepoints = Object.values(iconsByCodepoint).filter((icons) => icons.length > 1);

    if (missingFromMapping.length || missingFromFiles.length || invalidCodepoints.length || sharedCodepoints.length) {
        console.error('Issues found with mapping.json:');

        if (missingFromMapping.length) {
            console.error('❌ These SVG files are missing in mapping.json:\n' + missingFromMapping.join('\n'));
        }
        if (missingFromFiles.length) {
            console.error('❌ These mappings refer to non-existent SVG files:\n' + missingFromFiles.join('\n'));
        }
        if (invalidCodepoints.length) {
            console.error('❌ These mappings have no valid codepoint:\n' + invalidCodepoints.join('\n'));
        }
        if (sharedCodepoints.length) {
            console.error(
                '❌ These icons share a codepoint:\n' +
                    sharedCodepoints.map((icons) => `${mapping[icons[0]].codepoint}: ${icons.join(', ')}`).join('\n')
            );
        }

        process.exit(1);
    }

    console.log('✅ Everything is OK');
}

main();
