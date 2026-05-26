const SVGSpriter = require('svg-sprite');
const path = require('path');
const fs = require('fs');

// SVGs live directly in this package's svg/ directory
const svgIconsRelativePath = 'svg';

if (!fs.existsSync(svgIconsRelativePath)) {
    console.error('SVG source directory not found. Run figma:sync first.');
    process.exit(1);
}

const config = {
    dest: './dist/',

    svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
        namespaceIDs: false,
        dimensionAttributes: true,
        rootAttributes: { xmlns: 'http://www.w3.org/2000/svg' }
    },
    mode: {
        symbol: {
            prefix: '.kbq-%s',
            inline: true,
            example: {
                template: './templates/sprite.html'
            },
            render: {
                scss: true
            }
        }
    }
};

const spriter = new SVGSpriter(config);
const mappingJSON = require('../../mapping.json');

// eslint-disable-next-line no-unused-vars
const { $schema, ...mapping } = mappingJSON;

const mappingEntries = Object.entries(mapping);

const findNames = (symbol) => {
    return mappingEntries.filter(([_, s]) => s === symbol).map(([name]) => name);
};

mappingEntries.forEach(([mappedName, symbol]) => {
    const file = path.resolve(`${svgIconsRelativePath}/${mappedName}.svg`);

    if (fs.existsSync(file)) {
        for (const name of findNames(symbol)) {
            spriter.add(
                path.resolve(`${svgIconsRelativePath}/${name}.svg`),
                name + '.svg',
                fs.readFileSync(file, 'utf-8')
            );
        }
    }
});

spriter.config.log.on('logging', (transport, level, msg) => {
    if (level === 'error') {
        console.log(msg);
    }
});

spriter.compile(function (error, result) {
    if (error) {
        return console.log(error);
    }

    for (const mode of Object.values(result)) {
        for (const file of Object.values(mode)) {
            fs.mkdirSync(path.dirname(file.path), { recursive: true });
            fs.writeFileSync(file.path, file.contents);

            console.log(file.relative);
        }
    }
});
