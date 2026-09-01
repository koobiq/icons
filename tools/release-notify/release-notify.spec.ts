import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

// The extraction logic itself (isVersionLine/extractReleaseNotes/parseTag/resolveChangelogPath)
// is tested in @koobiq/cli. This only smoke-tests that the wrapper script is wired to it
// correctly against this repo's real CHANGELOG.md.
const SCRIPT_PATH = fileURLToPath(new URL('./release-notify.ts', import.meta.url));

const run = (tag: string): string =>
    execFileSync('npx', ['tsx', SCRIPT_PATH, tag], { encoding: 'utf8', cwd: process.cwd() });

describe('release-notify.ts', () => {
    it('prints the release title and notes for a known tag', () => {
        const output = run('12.1.1');

        assert.match(output, /^## 12\.1\.1 \(2026-07-14\)/);
        assert.match(output, /update circle-xs icons/);
    });

    it('falls back to a plain message for a tag with no changelog entry', () => {
        const output = run('99.0.0');

        assert.equal(output.trim(), 'Released 99.0.0');
    });

    it('falls back to a plain message for a scoped tag with no project changelog', () => {
        const output = run('no-such-project@1.0.0');

        assert.equal(output.trim(), 'Released no-such-project@1.0.0');
    });
});
