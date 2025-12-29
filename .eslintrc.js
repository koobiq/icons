// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    env: {
        node: true
    },
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2024
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
