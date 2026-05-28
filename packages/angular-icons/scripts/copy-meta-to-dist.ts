import * as fs from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../dist');
const projectRoot = join(__dirname, '..');
const workspaceRoot = join(__dirname, '../../..');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

console.log(join(workspaceRoot, 'LICENSE'));

for (const src of [join(workspaceRoot, 'LICENSE'), join(projectRoot, 'README.md')]) {
    console.log(join(distDir, basename(src)));

    fs.copyFileSync(src, join(distDir, basename(src)));
}
