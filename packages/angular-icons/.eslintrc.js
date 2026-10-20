// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    extends: ['../../.eslintrc.js'],
    ignorePatterns: ['dist/', 'icons/**/*.ts', 'public-api.ts'],
    overrides: [
        {
            files: ['**/*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: ['tsconfig.json'],
                tsconfigRootDir: __dirname
            },
            plugins: ['@typescript-eslint'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                // should be last
                'plugin:prettier/recommended'
            ],
            rules: {
                '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
                ]
            }
        }
    ]
};

module.exports = config;
