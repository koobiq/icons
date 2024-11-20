// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    env: {
        es2022: true,
        node: true
    },
    parserOptions: {
        sourceType: 'module'
    },
    extends: [
        'eslint:recommended',
        // should be last
        'plugin:prettier/recommended'
    ],
    rules: {
        'no-unused-vars': [1, { argsIgnorePattern: '^_' }]
    }
};

module.exports = config;
