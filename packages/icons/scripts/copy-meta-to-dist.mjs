import * as fs from 'fs';
import fsExtra from 'fs-extra';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../../../dist/packages/icons');
const projectRoot = join(__dirname, '..');
const workspaceRoot = join(__dirname, '../../..');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

for (const src of [
    join(workspaceRoot, 'LICENSE'),
    join(workspaceRoot, 'CHANGELOG.md'),
    join(projectRoot, 'README.md'),
    join(projectRoot, 'package.json')
]) {
    fs.copyFileSync(src, join(distDir, basename(src)));
}

if (!fs.existsSync(`${distDir}/info`)) {
    fs.mkdirSync(`${distDir}/info`);
}

fsExtra.copySync(join(projectRoot, 'svg'), join(distDir, 'svg'));
fsExtra.copySync(join(workspaceRoot, 'packages/visuals/dark'), join(distDir, 'images/dark'));
fsExtra.copySync(join(workspaceRoot, 'packages/visuals/light'), join(distDir, 'images/light'));

const mappingJSON = JSON.parse(fsExtra.readFileSync(new URL('../../../mapping.json', import.meta.url)));

// eslint-disable-next-line no-unused-vars
const { $schema, ...mapping } = mappingJSON;

Object.entries(mapping).forEach(([_, value]) => {
    value.code = parseInt(value.code);
});

fs.writeFileSync(join(distDir, 'info/kbq-icons-info.json'), JSON.stringify(mapping));
