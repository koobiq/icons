const fs = require('fs');
const packageJSON = require('./package.json');
const { Handlebars, codepoints, fontFamily, fontTypes } = require('./scripts/fantasticicon-utils');

const majorMinor = packageJSON.version.split('.').slice(0, 2).join('.');

if (!fs.existsSync('./svg')) {
    console.error('SVG source directory not found. Run figma:sync first.');
}

if (!fs.existsSync('../../dist/packages/icons/fonts')) {
    fs.mkdirSync('../../dist/packages/icons/fonts', { recursive: true });
}

Handlebars.registerPartial(
    'fontFace',
    `
@font-face {
   font-family: "${fontFamily}";
   font-weight: normal;
   font-style: normal;
   src: {{{ fontSrc }}};
}
  `
);

Handlebars.registerPartial(
    'selector',
    `
.kbq {
font-family: "${fontFamily}";
display:inline-block;
vertical-align:middle;
line-height:1;
font-weight:normal;
font-style:normal;
speak:none;
text-decoration:inherit;
text-transform:none;
text-rendering:auto;
-webkit-font-smoothing:antialiased;
-moz-osx-font-smoothing:grayscale;
transform:rotate(0.001deg);
}
  `
);

module.exports = {
    name: 'kbq-icons',
    prefix: 'kbq',
    codepoints: codepoints,
    inputDir: 'svg',
    outputDir: '../../dist/packages/icons/fonts',
    fontTypes: fontTypes,
    normalize: true,
    assetTypes: ['css', 'scss', 'html'],
    templates: {
        html: 'templates/preview.hbs',
        css: 'templates/css.hbs',
        scss: 'templates/scss.hbs'
    },
    formatOptions: {
        ttf: {
            url: 'https://github.com/koobiq/icons',
            description: packageJSON.description,
            copyright: 'Copyright (c) 2026 Koobiq Team',
            familyname: 'Koobiq Icons',
            fullname: 'Koobiq Icons',
            version: majorMinor
        }
    },
    fontHeight: 512,
    descent: 72
};
