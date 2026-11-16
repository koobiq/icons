// @ts-check

const { readdirSync } = require('fs');
const { resolve } = require('path');

/** Package directories (`icons`, `angular-icons`, `react-icons`, `visuals`): a scope names the package. */
const packageScopes = readdirSync(resolve(__dirname, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                ...packageScopes,

                // Dependabot scopes
                'deps',
                'deps-dev',
                // `nx release` commits `chore(release): ...` through the commit-msg hook
                'release'
            ]
        ]
    }
};

module.exports = config;
