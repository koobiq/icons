const Handlebars = require('handlebars');
const mappingInterop = require('../mapping-interop.json');
const mapping = require('../mapping.json');

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

Object.entries(mapping).forEach(([key, value]) => {
    const parsedCodePoint = parseInt(value.codepoint);
    const interopIconName = mappingInterop[key];

    codepoints[key] = parsedCodePoint;

    if (interopIconName) {
        codepoints[mappingInterop[key]] = parsedCodePoint;
    }
});

module.exports = {
    codepoints,
    Handlebars
};
