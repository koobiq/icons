// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    extends: ['../../.eslintrc.js'],
    ignorePatterns: ['dist/', 'src/'],
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
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
                'no-debugger': 'error',
                'no-alert': 'error',
                '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
                ],
                '@typescript-eslint/naming-convention': ['error', { selector: 'typeLike', format: ['PascalCase'] }]
            }
        }
    ]
};

module.exports = config;
