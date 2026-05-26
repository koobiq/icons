import * as fs from 'fs';
import fsExtra from 'fs-extra';

const distDir = 'packages/icons/dist';

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync('LICENSE', `${distDir}/LICENSE`);
fs.copyFileSync('README.md', `${distDir}/README.md`);
fs.copyFileSync('CHANGELOG.md', `${distDir}/CHANGELOG.md`);

if (!fs.existsSync(`${distDir}/info`)) {
    fs.mkdirSync(`${distDir}/info`);
}

const mappingJSON = JSON.parse(fsExtra.readFileSync(new URL('../mapping.json', import.meta.url)));
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
        fontVersion: '1.0',
        description: 'Koobiq icons',
        publishConfig: {
            access: 'public'
        },
        author: 'Koobiq Team',
        license: 'MIT',
        keywords: ['design-system', 'koobiq', 'fonts', 'icons', 'symbols'],
        exports: {
            './*': {
                default: './*'
            }
        }
    };
}

fs.writeFileSync(`${distDir}/info/kbq-icons-info.json`, JSON.stringify(mapping));
fs.writeFileSync(`${distDir}/package.json`, JSON.stringify(createPackageJson(), null, 4));
