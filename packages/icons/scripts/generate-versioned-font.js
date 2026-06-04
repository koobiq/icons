const packageJSON = require('../package.json');
const fs = require('fs');
const { Handlebars, codepoints } = require('./fantasticicon-utils');
const { generateFonts, FontAssetType, OtherAssetType } = require('fantasticon');

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
   font-family: "Koobiq Icons ${packageJSON.version}";
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
font-family: "Koobiq Icons ${packageJSON.version}";
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
    fontTypes: [FontAssetType.TTF, FontAssetType.WOFF],
    normalize: true,
    assetTypes: [OtherAssetType.CSS, OtherAssetType.SCSS, OtherAssetType.HTML],
    templates: {
        html: './templates/preview.hbs',
        css: './templates/css.hbs',
        scss: './templates/scss.hbs'
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
});
