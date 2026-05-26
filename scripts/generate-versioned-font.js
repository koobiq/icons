const packageJSON = require('../package.json');
const fs = require('fs');
const { Handlebars, codepoints } = require('./fantasticicon-utils');
const { generateFonts, FontAssetType, OtherAssetType } = require('fantasticon');

if (!fs.existsSync('packages/icons/svg')) {
    console.error('SVG source directory not found at packages/icons/svg');
}

if (!fs.existsSync('packages/icons/dist/fonts')) {
    fs.mkdirSync('packages/icons/dist/fonts', { recursive: true });
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
    inputDir: 'packages/icons/svg',
    outputDir: 'packages/icons/dist/fonts',
    fontTypes: [FontAssetType.TTF, FontAssetType.WOFF],
    normalize: true,
    assetTypes: [OtherAssetType.CSS, OtherAssetType.SCSS, OtherAssetType.HTML],
    templates: {
        html: 'packages/icons/templates/preview.hbs',
        css: 'packages/icons/templates/css.hbs',
        scss: 'packages/icons/templates/scss.hbs'
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
