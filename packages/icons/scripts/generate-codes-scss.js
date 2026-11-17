// Generates the Sass module with the icon font's characters by icon name, kbq-icons-codes.scss, and its twin
// for the versioned font: for places that take the character itself rather than a `.kbq-*` class, such as
// `content` or a custom property. Names and old names come from fantasticicon-utils.js, as for the font.

const fs = require('fs');
const path = require('path');
const packageJSON = require('../package.json');
const { Handlebars, deprecatedNames, fontFamily, mapping } = require('./fantasticicon-utils');

const outputDir = path.join(__dirname, '../../../dist/packages/icons/fonts');

const render = (template, data) =>
    Handlebars.compile(fs.readFileSync(path.join(__dirname, '../templates', template), 'utf8'))(data);

fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(
    path.join(outputDir, 'kbq-icons-codes.scss'),
    render('codes-scss.hbs', {
        family: fontFamily,
        codes: Object.entries(mapping).map(([name, { codepoint }]) => ({
            name,
            hex: parseInt(codepoint).toString(16)
        })),
        deprecated: deprecatedNames.map(([oldName, name]) => ({ oldName, name }))
    })
);

// The versioned font has the same icons and codepoints, only its font-family differs
fs.writeFileSync(
    path.join(outputDir, `kbq-icons-codes-${packageJSON.version}.scss`),
    render('codes-scss-versioned.hbs', {
        family: `${fontFamily} ${packageJSON.version}`,
        version: packageJSON.version
    })
);
