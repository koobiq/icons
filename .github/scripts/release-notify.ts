#!/usr/bin/env -S npx tsx
/**
 * Prints a Mattermost-ready release announcement for a git tag, reading only the
 * already-committed CHANGELOG.md — no GitHub API involved, so the notification
 * isn't gated on GitHub being reachable.
 *
 * `isVersionLine` / `extractReleaseNotes` mirror @koobiq/cli's
 * packages/cli/src/release/extract-release-notes.ts exactly, so they can be
 * lifted back into @koobiq/cli unchanged. `parseTag` / `resolveChangelogPath` are
 * the only additions, needed for repos with project-scoped tags (e.g. @koobiq/data-grid's
 * `{projectName}@{version}`) instead of a single workspace-wide `{version}` tag.
 *
 * Usage: npx tsx release-notify.ts <tag>
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const isVersionLine = (line: string): boolean => /\d+\.\d+\.\d+.*\(\d{4}-\d{2}-\d{2}\)/.test(line);

export type ChangelogReleaseNotes = { releaseNotes: string; releaseTitle: string };

export function extractReleaseNotes(changelogPath: string, versionName: string): ChangelogReleaseNotes | null {
    const changelogContent = readFileSync(changelogPath, 'utf8');
    const lines = changelogContent.split('\n');

    let releaseTitle = '';
    let releaseNotes = '';

    for (const line of lines) {
        const isLineWithReleaseVersion = isVersionLine(line);

        if (isLineWithReleaseVersion && line.includes(versionName)) {
            releaseTitle = line;
            continue;
        }

        if (releaseTitle && isLineWithReleaseVersion) break;

        if (releaseTitle) {
            releaseNotes += `${line}\n`;
        }
    }

    if (!releaseTitle) return null;

    return { releaseNotes, releaseTitle };
}

export type ParsedTag = { project: string | null; version: string };

/** Splits an nx release tag into its optional project scope and version. */
export function parseTag(tag: string): ParsedTag {
    const at = tag.lastIndexOf('@');

    if (at === -1) {
        return { project: null, version: tag };
    }

    return { project: tag.slice(0, at), version: tag.slice(at + 1) };
}

/**
 * Resolves which changelog file to read for a parsed tag: a project's own
 * changelog for a scoped tag, falling back to the workspace root changelog
 * (matches this and @koobiq/data-grid's nx release layout).
 */
export function resolveChangelogPath(workspaceRoot: string, { project }: ParsedTag): string {
    if (project) {
        const projectChangelog = join(workspaceRoot, 'packages', project, 'CHANGELOG.md');

        if (existsSync(projectChangelog)) {
            return projectChangelog;
        }
    }

    return join(workspaceRoot, 'CHANGELOG.md');
}

function main(): void {
    const tag = process.argv[2];

    if (!tag) {
        console.error('usage: release-notify.ts <tag>');
        process.exit(1);
    }

    const parsedTag = parseTag(tag);
    const changelogPath = resolveChangelogPath(process.cwd(), parsedTag);
    const notes = existsSync(changelogPath) ? extractReleaseNotes(changelogPath, parsedTag.version) : null;

    if (!notes) {
        console.log(`Released ${tag}`);

        return;
    }

    console.log(`${notes.releaseTitle}\n${notes.releaseNotes}`.trimEnd());
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
