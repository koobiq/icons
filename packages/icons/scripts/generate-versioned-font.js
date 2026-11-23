const packageJSON = require('../package.json');
const fs = require('fs');
const { Handlebars, codepoints, fontFamily, fontMetadata, fontTypes } = require('./fantasticicon-utils');
const { generateFonts, OtherAssetType } = require('fantasticon');

const majorMinor = packageJSON.version.split('.').slice(0, 2).join('.');

if (!fs.existsSync('./svg')) {
    console.error('SVG source directory not found at ./svg');
}

if (!fs.existsSync('../../dist/packages/icons/fonts')) {
    fs.mkdirSync('../../dist/packages/icons/fonts', { recursive: true });
}

Handlebars.registerPartial(
    'fontFace',
    `
@font-face {
   font-family: "${fontFamily} ${packageJSON.version}";
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
font-family: "${fontFamily} ${packageJSON.version}";
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

generateFonts({
    name: `kbq-icons-${packageJSON.version}`,
    prefix: 'kbq',
    codepoints: codepoints,
    inputDir: './svg',
    outputDir: '../../dist/packages/icons/fonts',
    fontTypes: fontTypes,
    normalize: true,
    assetTypes: [OtherAssetType.CSS, OtherAssetType.SCSS, OtherAssetType.HTML],
    templates: {
        html: './templates/preview.hbs',
        css: './templates/css.hbs',
        scss: './templates/scss.hbs'
    },
    formatOptions: {
        ttf: {
            ...fontMetadata,
            description: packageJSON.description,
            familyname: fontFamily,
            fullname: `${fontFamily} ${packageJSON.version}`,
            version: majorMinor
        }
    },
    fontHeight: 512,
    descent: 72
});
