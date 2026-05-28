// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    extends: ['../../.eslintrc.js'],
    ignorePatterns: ['dist/', 'icons/'],
    overrides: [
        {
            files: ['**/*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: ['tsconfig.json'],
                tsconfigRootDir: __dirname
            },
            plugins: ['@typescript-eslint'],
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
            rules: {
                '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
                'no-unused-vars': 'off'
            }
        }
    ]
};

module.exports = config;
