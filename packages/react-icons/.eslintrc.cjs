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
            plugins: ['@typescript-eslint', 'react-hooks'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:react/recommended',
                'plugin:react/jsx-runtime',
                // should be last
                'plugin:prettier/recommended'
            ],
            settings: {
                react: { version: 'detect' }
            },
            rules: {
                'no-debugger': 'error',
                'no-alert': 'error',
                'react-hooks/rules-of-hooks': 'error',
                'react-hooks/exhaustive-deps': 'off',
                'react/prop-types': 'off',
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
