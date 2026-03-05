const packageJSON = require('../package.json');
const mapping = require('../mapping.json');
const mappingInterop = require('../mapping-interop.json');
const fs = require('fs');
const Handlebars = require('handlebars');
const { generateFonts, FontAssetType, OtherAssetType } = require('fantasticon');

if (!fs.existsSync('dist/icons/svg')) {
    console.error('Build at first package with svg icons');
}

const codepoints = {};

Object.entries(mapping).forEach(([key, value]) => {
    const parsedCodePoint = parseInt(value.codepoint);
    const interopIconName = mappingInterop[key];

    codepoints[key] = parsedCodePoint;

    if (interopIconName) {
        codepoints[mappingInterop[key]] = parsedCodePoint;
    }
});

if (!fs.existsSync('dist/icons/fonts')) {
    fs.mkdirSync('dist/icons/fonts');
}

if (!fs.existsSync('dist/icons/fonts/versioned-selector')) {
    fs.mkdirSync('dist/icons/fonts/versioned-selector');
}

const selectorName = (selectorName) => {
    return `
${selectorName} {
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
  `;
};

Handlebars.registerHelper('splitFontSize', function (str) {
    return str.split('_')[1];
});
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
Handlebars.registerPartial('selector', selectorName('.kbq'));
Handlebars.registerPartial('previewClassName', `kbq-${packageJSON.version}`);

const baseConfig = {
    name: `kbq-icons-${packageJSON.version}`,
    prefix: 'kbq',
    codepoints: codepoints,
    inputDir: 'dist/icons/svg',
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
};

generateFonts({
    ...baseConfig,
    outputDir: 'dist/icons/fonts'
}).then(() => {
    Handlebars.registerPartial('selector', selectorName(`.kbq-${packageJSON.version.replace(/\./g, '\\.')}`));

    return generateFonts({
        ...baseConfig,
        templates: {
            ...baseConfig.templates,
            html: 'src/templates/preview-versioned.hbs'
        },
        outputDir: 'dist/icons/fonts/versioned-selector'
    });
});
