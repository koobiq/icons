// @ts-check

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
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
