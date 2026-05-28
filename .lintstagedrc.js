const { relative } = require('path');

module.exports = {
    '*': 'prettier --write --ignore-unknown',
    '*.{ts,tsx,js,mjs,cjs}': (files) => {
        const relativeFiles = files.map((f) => relative(process.cwd(), f));
        return `nx affected -t lint --fix --files=${relativeFiles.join(',')}`;
    }
};
