import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { extractReleaseNotes, isVersionLine, parseTag, resolveChangelogPath } from './release-notify';

const SAMPLE_CHANGELOG = `## 12.1.1 (2026-07-14)

### 🚀 Features

- update circle-xs icons (#DS-5305) ([#139](https://github.com/koobiq/icons/pull/139))

### ❤️ Thank You

- Roman Turov @rmnturov

## 12.1.0 (2026-06-24)

### 🚀 Features

- add floating-window icons (16, 24) (#DS-5187) ([#123](https://github.com/koobiq/icons/pull/123))

### 🩹 Fixes

- split duotone icon zones by layer name instead of color ([#125](https://github.com/koobiq/icons/pull/125))

# 12.0.0 (2026-06-05)

### 🚀 Features

- moved all packages to single release ([590ae8b](https://github.com/koobiq/icons/commit/590ae8b))

### ⚠️ Breaking Changes

- removed visuals images from @koobiq/icons distribution

## 11.6.2 (2026-06-05)

This was a version bump only for @koobiq/icons to align it with other projects, there were no code changes.
`;

describe('isVersionLine', () => {
    it('matches a heading with a version and a date', () => {
        assert.equal(isVersionLine('## 12.1.1 (2026-07-14)'), true);
        assert.equal(isVersionLine('# 12.0.0 (2026-06-05)'), true);
    });

    it('does not match a subsection heading without a date', () => {
        assert.equal(isVersionLine('### 🚀 Features'), false);
        assert.equal(isVersionLine('### ❤️ Thank You'), false);
    });

    it('does not match a plain changelog body line', () => {
        assert.equal(isVersionLine('- update circle-xs icons (#DS-5305)'), false);
    });
});

describe('extractReleaseNotes', () => {
    let dir: string;
    let changelogPath: string;

    before(() => {
        dir = mkdtempSync(join(tmpdir(), 'release-notify-'));
        changelogPath = join(dir, 'CHANGELOG.md');
        writeFileSync(changelogPath, SAMPLE_CHANGELOG);
    });

    after(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    it('extracts the section for a version between two other versions', () => {
        const result = extractReleaseNotes(changelogPath, '12.1.0');

        assert.notEqual(result, null);
        assert.equal(result!.releaseTitle, '## 12.1.0 (2026-06-24)');
        assert.match(result!.releaseNotes, /add floating-window icons/);
        assert.match(result!.releaseNotes, /split duotone icon zones/);
    });

    it('extracts the section for the latest version', () => {
        const result = extractReleaseNotes(changelogPath, '12.1.1');

        assert.notEqual(result, null);
        assert.equal(result!.releaseTitle, '## 12.1.1 (2026-07-14)');
        assert.match(result!.releaseNotes, /update circle-xs icons/);
    });

    it('extracts the section for the oldest version', () => {
        const result = extractReleaseNotes(changelogPath, '11.6.2');

        assert.notEqual(result, null);
        assert.equal(result!.releaseTitle, '## 11.6.2 (2026-06-05)');
        assert.match(result!.releaseNotes, /version bump only/);
    });

    it('does not stop at a subsection heading within the same version', () => {
        const result = extractReleaseNotes(changelogPath, '12.1.0');

        assert.match(result!.releaseNotes, /### 🚀 Features/);
        assert.match(result!.releaseNotes, /### 🩹 Fixes/);
    });

    it('does not include notes from a neighboring version', () => {
        const result = extractReleaseNotes(changelogPath, '12.1.1');

        assert.doesNotMatch(result!.releaseNotes, /add floating-window icons/);
        assert.doesNotMatch(result!.releaseNotes, /12\.1\.0/);
    });

    it('handles a single-# version heading, not just ##', () => {
        const result = extractReleaseNotes(changelogPath, '12.0.0');

        assert.notEqual(result, null);
        assert.equal(result!.releaseTitle, '# 12.0.0 (2026-06-05)');
        assert.match(result!.releaseNotes, /Breaking Changes/);
    });

    it('returns null when the version is not found', () => {
        const result = extractReleaseNotes(changelogPath, '99.0.0');

        assert.equal(result, null);
    });
});

describe('parseTag', () => {
    it('parses a plain fixed-group tag as version-only', () => {
        assert.deepEqual(parseTag('12.1.1'), { project: null, version: '12.1.1' });
    });

    it('parses a project-scoped tag into project and version', () => {
        assert.deepEqual(parseTag('ag-grid-angular-theme@34.5.1'), {
            project: 'ag-grid-angular-theme',
            version: '34.5.1'
        });
    });

    it('splits on the last @ so a scoped npm package name still works', () => {
        assert.deepEqual(parseTag('@koobiq/visuals@1.0.0'), {
            project: '@koobiq/visuals',
            version: '1.0.0'
        });
    });
});

describe('resolveChangelogPath', () => {
    let workspaceRoot: string;

    before(() => {
        workspaceRoot = mkdtempSync(join(tmpdir(), 'release-notify-workspace-'));
        writeFileSync(join(workspaceRoot, 'CHANGELOG.md'), SAMPLE_CHANGELOG);
        mkdirSync(join(workspaceRoot, 'packages', 'react-icons'), { recursive: true });
        writeFileSync(join(workspaceRoot, 'packages', 'react-icons', 'CHANGELOG.md'), SAMPLE_CHANGELOG);
    });

    after(() => {
        rmSync(workspaceRoot, { recursive: true, force: true });
    });

    it('resolves to the root changelog for an unscoped tag', () => {
        const path = resolveChangelogPath(workspaceRoot, { project: null, version: '12.1.1' });

        assert.equal(path, join(workspaceRoot, 'CHANGELOG.md'));
    });

    it('resolves to the project changelog when it exists', () => {
        const path = resolveChangelogPath(workspaceRoot, { project: 'react-icons', version: '12.1.1' });

        assert.equal(path, join(workspaceRoot, 'packages', 'react-icons', 'CHANGELOG.md'));
    });

    it('falls back to the root changelog when the project has none', () => {
        const path = resolveChangelogPath(workspaceRoot, { project: 'no-such-project', version: '1.0.0' });

        assert.equal(path, join(workspaceRoot, 'CHANGELOG.md'));
    });
});
