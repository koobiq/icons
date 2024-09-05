const packageJSON = require('./package.json');
const mapping = require('./mapping.json');
const fs = require('fs');

if (!fs.existsSync('dist/icons/svg')) {
    console.error('Build at first package with svg icons')
}

const codepoints = {};

Object.entries(mapping).forEach(([key, value]) => {
    codepoints[key] = parseInt(value.code);
});

if (!fs.existsSync('dist/icons/fonts')) {
    fs.mkdirSync('dist/icons/fonts');
}

const Handlebars = require('handlebars');
Handlebars.registerHelper('splitFontSize', function(str) {
    return str.split('_')[1];
});

module.exports = {
    name: 'kbq-icons',
    prefix: 'kbq',
    codepoints: codepoints,
    inputDir: 'dist/icons/svg',
    outputDir: 'dist/icons/fonts',
    fontTypes: ['ttf', 'woff'],
    normalize: true,
    assetTypes: ['css', 'scss', 'html'],
    templates: {
        html: 'src/templates/preview.hbs',
        css: 'src/templates/css.hbs',
        scss: 'src/templates/scss.hbs'
    },
    formatOptions: {
        ttf: {
            url: packageJSON.url,
            description: packageJSON.description,
            version: packageJSON.fontVersion
        }
    },
    fontHeight: 512,
    descent: 72,
};
