// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    extends: ['../../.eslintrc.js'],
    ignorePatterns: ['dist/', 'src/'],
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            parserOptions: {
                project: ['tsconfig.json'],
                tsconfigRootDir: __dirname
            }
        }
    ]
};

module.exports = config;
