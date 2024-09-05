import * as fs from 'fs';
import fsExtra from 'fs-extra';

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
    fs.mkdirSync('dist/icons');
}

fs.copyFileSync('LICENSE', 'dist/icons/LICENSE');
fs.copyFileSync('README.md', 'dist/icons/README.md');
fs.copyFileSync('CHANGELOG.md', 'dist/icons/CHANGELOG.md');

if (!fs.existsSync('dist/icons/info')) {
    fs.mkdirSync('dist/icons/info');
}

if (!fs.existsSync('dist/icons/svg')) {
    fs.mkdirSync('dist/icons/svg');
}

if (!fs.existsSync('dist/icons/images')) {
    fs.mkdirSync('dist/icons/images');
}

fsExtra.copySync('./src/svg', 'dist/icons/svg');
fsExtra.copySync('./src/images', 'dist/icons/images');

import mapping from '../mapping.json' assert { type: 'json' };
import packageJSON from '../package.json' assert { type: 'json' };

Object.entries(mapping).forEach(([key, value]) => {
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
        keywords: [
            'design-system',
            'koobiq',
            'fonts',
            'icons',
            'symbols'
        ],
        exports: {
            './*': {
                'default': './*'
            }
        }
    };

}

fs.writeFileSync('dist/icons/info/kbq-icons-info.json', JSON.stringify(mapping));
fs.writeFileSync('dist/icons/package.json', JSON.stringify(createPackageJson(), null, 4));
