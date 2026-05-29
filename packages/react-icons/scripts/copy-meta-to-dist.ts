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

for (const src of [
    join(workspaceRoot, 'LICENSE'),
    join(projectRoot, 'README.md'),
    join(projectRoot, 'manifest.json')
]) {
    fs.copyFileSync(src, join(distDir, basename(src)));
}

const pkg = JSON.parse(fs.readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

const distPkg = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    license: pkg.license,
    keywords: pkg.keywords,
    publishConfig: pkg.publishConfig,
    type: pkg.type,
    exports: pkg.exports,
    sideEffects: pkg.sideEffects,
    peerDependencies: pkg.peerDependencies
};

fs.writeFileSync(join(distDir, 'package.json'), JSON.stringify(distPkg, null, 4));
