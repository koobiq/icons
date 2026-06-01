import * as fs from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../../../dist/packages/angular-icons');
const workspaceRoot = join(__dirname, '../../..');
const licenseSrc = join(workspaceRoot, 'LICENSE');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync(licenseSrc, join(distDir, basename(licenseSrc)));
