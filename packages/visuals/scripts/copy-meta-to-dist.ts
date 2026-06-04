import * as fs from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../../../dist/packages/visuals');
const projectRoot = join(__dirname, '..');
const workspaceRoot = join(__dirname, '../../..');

if (!fs.existsSync(distDir)) {
    fs.cpSync(join(projectRoot, 'dark'), join(distDir, 'dark'), { recursive: true });
    fs.cpSync(join(projectRoot, 'light'), join(distDir, 'light'), { recursive: true });
}

for (const src of [join(workspaceRoot, 'LICENSE'), join(projectRoot, 'package.json'), join(projectRoot, 'README.md')]) {
    fs.copyFileSync(src, join(distDir, basename(src)));
}
