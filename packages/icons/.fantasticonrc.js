const fs = require('fs');
const packageJSON = require('./package.json');
const { Handlebars, codepoints } = require('./scripts/fantasticicon-utils');

if (!fs.existsSync('./svg')) {
    console.error('SVG source directory not found. Run figma:sync first.');
}

if (!fs.existsSync('./dist/fonts')) {
    fs.mkdirSync('./dist/fonts', { recursive: true });
}

Handlebars.registerPartial(
    'fontFace',
    `
@font-face {
   font-family: "Koobiq Icons";
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
font-family: "Koobiq Icons";
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
    outputDir: 'dist/fonts',
    fontTypes: ['ttf', 'woff'],
    normalize: true,
    assetTypes: ['css', 'scss', 'html'],
    templates: {
        html: 'templates/preview.hbs',
        css: 'templates/css.hbs',
        scss: 'templates/scss.hbs'
    },
    formatOptions: {
        ttf: {
            url: packageJSON.url,
            description: packageJSON.description,
            // font version must contain only major and minor
            version: packageJSON.version.slice(0, -2)
        }
    },
    fontHeight: 512,
    descent: 72
};
