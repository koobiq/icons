/* global Uint8Array */

const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');

const packageJSON = require('../package.json');
const distFontsDir = path.resolve(__dirname, '../../../dist/packages/icons/fonts');

const metadata = {
    copyright: `Copyright (c) ${new Date().getFullYear()} Koobiq Team`,
    manufacturer: 'Koobiq',
    designer: 'Koobiq Team',
    license: 'MIT License',
    licenseURL: 'https://github.com/koobiq/icons/blob/main/LICENSE',
    manufacturerURL: 'https://github.com/koobiq/icons',
    achVendID: 'KBQ '
};

function patchFont(baseName) {
    const ttfPath = path.join(distFontsDir, `${baseName}.ttf`);

    if (!fs.existsSync(ttfPath)) {
        throw new Error(`TTF file not found: ${ttfPath}`);
    }

    const font = opentype.parse(fs.readFileSync(ttfPath));

    for (const platform of ['macintosh', 'windows']) {
        if (!font.names[platform]) {
            continue;
        }

        font.names[platform].copyright = { en: metadata.copyright };
        font.names[platform].manufacturer = { en: metadata.manufacturer };
        font.names[platform].designer = { en: metadata.designer };
        font.names[platform].license = { en: metadata.license };
        font.names[platform].licenseURL = { en: metadata.licenseURL };
        font.names[platform].manufacturerURL = { en: metadata.manufacturerURL };
    }

    font.tables.os2.achVendID = metadata.achVendID;

    const ttfBuffer = Buffer.from(font.toArrayBuffer());

    fs.writeFileSync(ttfPath, ttfBuffer);

    const woffPath = path.join(distFontsDir, `${baseName}.woff`);

    if (fs.existsSync(woffPath)) {
        fs.writeFileSync(woffPath, Buffer.from(ttf2woff(new Uint8Array(ttfBuffer)).buffer));
    }

    const woff2Path = path.join(distFontsDir, `${baseName}.woff2`);

    if (fs.existsSync(woff2Path)) {
        fs.writeFileSync(woff2Path, ttf2woff2(ttfBuffer));
    }
}

patchFont('kbq-icons');
patchFont(`kbq-icons-${packageJSON.version}`);
