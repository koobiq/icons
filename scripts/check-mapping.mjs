import { readdir, readFile } from 'node:fs/promises';
import { parse } from 'path';

async function main() {
    const mapping = JSON.parse(await readFile('./mapping.json', 'utf-8'));
    const svgFileList = (await readdir('./src/svg')).map((svgPath) => parse(svgPath).name);
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
