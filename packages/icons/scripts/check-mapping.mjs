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
    const svgFileList = (await readdir(SVG_DIR)).map((svgPath) => parse(svgPath).name);
    const svgListInMapping = Object.keys(mapping).sort();

    if (process.argv.includes('--list')) {
        console.log(svgListInMapping.join('\n'));
        return;
    }

    const missingFromMapping = svgFileList.filter((svg) => !mapping[svg]);
    const missingFromFiles = svgListInMapping.filter((svg) => !svgFileList.includes(svg));

    if (missingFromMapping.length || missingFromFiles.length) {
        console.error('Issues found with mapping.json:');

        if (missingFromMapping.length) {
            console.error('❌ These SVG files are missing in mapping.json:\n' + missingFromMapping.join('\n'));
        }
        if (missingFromFiles.length) {
            console.error('❌ These mappings refer to non-existent SVG files:\n' + missingFromFiles.join('\n'));
        }

        process.exit(1);
    }

    console.log('✅ Everything is OK');
}

main();
