import * as fs from 'fs';
import fsExtra from 'fs-extra';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../../../dist/packages/icons');
const projectRoot = join(__dirname, '..');
const workspaceRoot = join(__dirname, '../../..');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync(join(workspaceRoot, 'LICENSE'), `${distDir}/LICENSE`);
fs.copyFileSync(join(projectRoot, 'README.md'), `${distDir}/README.md`);
fs.copyFileSync(join(projectRoot, 'CHANGELOG.md'), `${distDir}/CHANGELOG.md`);

if (!fs.existsSync(`${distDir}/info`)) {
    fs.mkdirSync(`${distDir}/info`);
}

if (!fs.existsSync(`${distDir}/svg`)) {
    fs.mkdirSync(`${distDir}/svg`);
}

fsExtra.copySync('./svg', `${distDir}/svg`);

const mappingJSON = JSON.parse(fsExtra.readFileSync(new URL('../../../mapping.json', import.meta.url)));
const packageJSON = JSON.parse(fsExtra.readFileSync(new URL('../package.json', import.meta.url)));

// eslint-disable-next-line no-unused-vars
const { $schema, ...mapping } = mappingJSON;

Object.entries(mapping).forEach(([_, value]) => {
    value.code = parseInt(value.code);
});

function createPackageJson() {
    return {
        name: packageJSON.name,
        version: packageJSON.version,
        fontVersion: packageJSON.fontVersion,
        description: packageJSON.description,
        publishConfig: {
            access: 'public'
        },
        author: packageJSON.author,
        license: packageJSON.license,
        keywords: packageJSON.keywords,
        exports: {
            './*': {
                default: './*'
            }
        }
    };
}

fs.writeFileSync(`${distDir}/info/kbq-icons-info.json`, JSON.stringify(mapping));
fs.writeFileSync(`${distDir}/package.json`, JSON.stringify(createPackageJson(), null, 4));
