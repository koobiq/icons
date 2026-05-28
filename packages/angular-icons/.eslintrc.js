// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
    extends: ['../../.eslintrc.js'],
    ignorePatterns: ['dist/'],
    overrides: [
        {
            files: ['**/*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: ['tsconfig.json'],
                tsconfigRootDir: __dirname
            },
            plugins: ['@typescript-eslint', '@angular-eslint'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@angular-eslint/recommended',
                // should be last
                'plugin:prettier/recommended'
            ],
            rules: {
                '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
                ],
                // enforce kbq prefix on all selectors
                '@angular-eslint/component-selector': [
                    'error',
                    { type: 'attribute', prefix: 'kbq', style: 'camelCase' }
                ],
                '@angular-eslint/directive-selector': [
                    'error',
                    { type: 'attribute', prefix: 'kbq', style: 'camelCase' }
                ],
                '@angular-eslint/component-class-suffix': ['off']
            }
        }
    ]
};

module.exports = config;
