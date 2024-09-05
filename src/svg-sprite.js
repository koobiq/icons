const SVGSpriter = require('svg-sprite');
const path = require('path');
const fs = require('fs');

const svgIconsRelativePath = 'dist/icons/svg';

if (!fs.existsSync(svgIconsRelativePath)) {
    console.error('Build at first package with svg icons');
}

const config = {

    dest: './dist/icons/',

    svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
        namespaceIDs: false,
        dimensionAttributes: false
    },
    mode: {
        "symbol": {
            "prefix": ".kbq-%s",
            "inline": true,
            "example": {
                "template": './src/templates/sprite.html'
            },
            render: {
                scss: true
            },
        }
    }
};

const spriter = new SVGSpriter(config);
const mapping = require('../mapping.json');

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
                fs.readFileSync(file, 'utf-8'),
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
