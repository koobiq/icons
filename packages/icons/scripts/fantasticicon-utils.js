const Handlebars = require('handlebars');
const mappingInterop = require('../../../mapping-interop.json');
const mappingJSON = require('../../../mapping.json');

// eslint-disable-next-line no-unused-vars
const { $schema, ...mapping } = mappingJSON;

Handlebars.registerHelper('splitFontSize', function (str) {
    return str.split('_')[1];
});
Handlebars.registerPartial(
    'interop',
    `
        ${Object.values(mappingInterop)
            .map((iconName) => {
                return `<div class="icon" data-name="${iconName}" title="${iconName}">
                    <span class="inner">
                        <i class="kbq kbq-${iconName}" aria-hidden="true"></i>
                    <span class='label'>${iconName}</span>
                </span>
            </div>`;
            })
            .join(' ')}
  `
);

const codepoints = {};

// `[old name, current name]` for each rename in mapping-interop.json: the old name keeps working
// with the current icon's codepoint (a `.kbq-<old name>` class, a deprecated name in the Sass codes module)
const deprecatedNames = [];

Object.entries(mapping).forEach(([key, value]) => {
    const parsedCodePoint = parseInt(value.codepoint);
    const interopIconName = mappingInterop[key];

    codepoints[key] = parsedCodePoint;

    if (interopIconName) {
        codepoints[interopIconName] = parsedCodePoint;
        deprecatedNames.push([interopIconName, key]);
    }
});

// Every name becomes a CSS class and a key of the Sass codes module, and an old name must point to one icon
const oldNames = deprecatedNames.map(([oldName]) => oldName);
const nameIssues = [
    ...[...Object.keys(mapping), ...oldNames]
        .filter((name) => !/^[\w-]+$/.test(name))
        .map((name) => `"${name}" has characters other than letters, digits, "_" and "-"`),
    ...oldNames
        .filter((name, index) => oldNames.indexOf(name) !== index)
        .map((name) => `old name "${name}" is given to several icons in mapping-interop.json`),
    ...oldNames
        .filter((name) => name in mapping)
        .map((name) => `old name "${name}" from mapping-interop.json is a current icon in mapping.json`)
];

if (nameIssues.length) {
    throw new Error(`Invalid icon names:\n${nameIssues.join('\n')}`);
}

// fantasticon writes @font-face `src` in this order; browsers use the first format they support
const fontTypes = ['woff2', 'woff', 'ttf'];

// `font-family` of the icon font; the versioned font appends the package version to it
const fontFamily = 'Koobiq Icons';

const fontMetadata = {
    copyright: 'Copyright (c) 2026 Koobiq Team',
    manufacturer: 'Koobiq',
    designer: 'Koobiq Team',
    license: 'MIT License',
    licenseURL: 'https://github.com/koobiq/icons/blob/main/LICENSE',
    url: 'https://github.com/koobiq/icons',
    achVendID: 'KBQ '
};

module.exports = {
    codepoints,
    deprecatedNames,
    fontFamily,
    fontMetadata,
    fontTypes,
    Handlebars,
    mapping
};
