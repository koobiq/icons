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
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            parser: '@typescript-eslint/parser',
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
