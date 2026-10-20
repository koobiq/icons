// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    extends: ['../../.eslintrc.js'],
    ignorePatterns: ['dist/', 'icons/**/*.ts', 'public-api.ts'],
    overrides: [
        {
            files: ['**/*.ts'],
            parserOptions: {
                project: ['tsconfig.json'],
                tsconfigRootDir: __dirname
            }
        }
    ]
};

module.exports = config;
