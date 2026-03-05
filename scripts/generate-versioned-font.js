const packageJSON = require('../package.json');
const fs = require('fs');
const { Handlebars, codepoints } = require('./fantasticicon-utils');
const { generateFonts, FontAssetType, OtherAssetType } = require('fantasticon');

if (!fs.existsSync('dist/icons/svg')) {
    console.error('Build at first package with svg icons');
}

if (!fs.existsSync('dist/icons/fonts')) {
    fs.mkdirSync('dist/icons/fonts');
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
    inputDir: 'dist/icons/svg',
    outputDir: 'dist/icons/fonts',
    fontTypes: [FontAssetType.TTF, FontAssetType.WOFF],
    normalize: true,
    assetTypes: [OtherAssetType.CSS, OtherAssetType.SCSS, OtherAssetType.HTML],
    templates: {
        html: 'src/templates/preview.hbs',
        css: 'src/templates/css.hbs',
        scss: 'src/templates/scss.hbs'
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
