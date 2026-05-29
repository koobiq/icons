import * as fs from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../../../dist/packages/react-icons');
const projectRoot = join(__dirname, '..');
const workspaceRoot = join(__dirname, '../../..');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

for (const src of [
    join(workspaceRoot, 'LICENSE'),
    join(projectRoot, 'README.md'),
    join(projectRoot, 'manifest.json'),
    join(projectRoot, 'package.json')
]) {
    fs.copyFileSync(src, join(distDir, basename(src)));
}
