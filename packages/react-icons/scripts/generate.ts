import { promises as fsp } from 'fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import type { KbqIconMeta, KbqIconsMetadata } from '@koobiq/icons/dist/types/icons';

import { transform } from '@svgr/core';

import type { IconMeta, IconSize } from './lib/icon-meta';
import { compareBySizeAndName, getLegacyMetas, parseIconKey } from './lib/icon-meta';

const INPUT_DIR = path.resolve('../icons/svg');
const MANIFEST_FILE = path.resolve('../../mapping.json');
const INTEROP_FILE = path.resolve('../../mapping-interop.json');
const OUTPUT_DIR = path.resolve('./src');
const LEGACY_DIR = path.join(OUTPUT_DIR, 'legacy');

type IconsManifest = {
    icons: {
        name: string;
        size: IconSize;
        keywords?: string[];
        description?: string;
    }[];
};

function buildEntryFile(entry: string, componentNames: string[]) {
    return `
${entry}

export type IconName = ${componentNames.join(' | ')};

export type IconsManifest = {
    icons: {
        name: IconName;
        size: '16' | '24' | '32' | '48' | '64';
        description?: string;
        keywords?: string[];
    }[];
};

export * from './legacy';
`;
}

async function buildManifest(): Promise<IconsManifest> {
    try {
        const iconsInfo: KbqIconsMetadata = JSON.parse(await fsp.readFile(MANIFEST_FILE, 'utf8'));

        const icons = Object.entries(iconsInfo)
            .filter(([key]) => key !== '$schema')
            .map(([key, data]: [string, KbqIconMeta]) => {
                const { size, name } = parseIconKey(key);
                const { description, tags } = data ?? {};

                return {
                    name,
                    size,
                    description: description || undefined,
                    keywords: Array.isArray(tags) && tags.length > 0 ? tags : undefined
                };
            });

        icons.sort(compareBySizeAndName);

        console.log(`✅ Manifest built from ${MANIFEST_FILE} (${icons.length} entries)`);

        return { icons } as IconsManifest;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`❌ Failed to load ${MANIFEST_FILE}:`, msg);

        return { icons: [] };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function template(variables: any, { tpl }: any) {
    return tpl`
    import { forwardRef } from 'react';
    import type { SVGProps, Ref } from 'react';

    export const ${variables.componentName} = forwardRef((${variables.props}) => (
        ${variables.jsx}
    ));

    ${variables.componentName}.displayName = '${variables.componentName}';
`;
}

function withDeprecationNotice(code: string, deprecatedFor: string): string {
    const comment = `\n/**\n * @deprecated\n * This icon has been deprecated, please use ${deprecatedFor} instead.\n */\n`;

    return code.replace('export const', `${comment}export const`);
}

const transformConfig = {
    template,
    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
    ref: true,
    svgo: true,
    svgoConfig: {
        plugins: [
            {
                name: 'replace-values',
                fn: () => ({
                    element: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        enter: (node: any) => {
                            if (node.name === 'svg') {
                                // eslint-disable-next-line no-param-reassign
                                // override svg fill attr for react icons
                                node.attributes.fill = 'currentColor';
                                return;
                            }
                        }
                    }
                })
            }
        ]
    },
    typescript: true
};

async function generateLegacy() {
    const interop: Record<string, string> = JSON.parse(await fsp.readFile(INTEROP_FILE, 'utf8'));
    const legacyMetas = getLegacyMetas(interop);

    await mkdir(LEGACY_DIR, { recursive: true });

    const results = await Promise.allSettled(
        legacyMetas.map(async (meta) => {
            const fileKey = `${meta.newKey}.svg`;
            const filePath = path.join(INPUT_DIR, fileKey);

            let svgCode: string;

            try {
                svgCode = await fsp.readFile(filePath, 'utf8');
            } catch {
                console.warn(`⚠️ Missing SVG: ${fileKey} (skipped, legacy ${meta.name})`);

                return;
            }

            const tsxCode = await transform(svgCode || '', transformConfig, {
                componentName: meta.name
            });

            const outputPath = path.join(LEGACY_DIR, `${meta.name}.tsx`);
            await fsp.writeFile(outputPath, withDeprecationNotice(tsxCode, parseIconKey(meta.newKey).name));
            console.log(`✅ (legacy) ${fileKey} → legacy/${meta.name}.tsx`);
        })
    );

    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed) {
        console.error(`❌ Legacy generation completed with errors: ${failed}/${results.length} files`);
    }

    const legacyIndexPath = path.join(LEGACY_DIR, 'index.ts');
    const legacyExports = legacyMetas.map((meta) => `export * from './${meta.name}';`);

    await fsp.writeFile(legacyIndexPath, `${legacyExports.join('\n')}\n`);
}

async function run() {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });

    const iconsInfo = JSON.parse(await fsp.readFile(MANIFEST_FILE, 'utf8'));
    const metas: IconMeta[] = Object.keys(iconsInfo)
        .filter((key) => key !== '$schema')
        .map(parseIconKey);

    metas.sort(compareBySizeAndName);

    const results = await Promise.allSettled(
        metas.map(async (meta) => {
            const fileKey = `${meta.key}.svg`;
            const filePath = path.join(INPUT_DIR, fileKey);

            let svgCode: string;

            try {
                svgCode = await fsp.readFile(filePath, 'utf8');
            } catch {
                console.warn(`⚠️ Missing SVG: ${fileKey} (skipped)`);

                return;
            }

            const tsxCode = await transform(svgCode || '', transformConfig, {
                componentName: meta.name
            });

            const outputPath = path.join(OUTPUT_DIR, `${meta.name}.tsx`);
            await fsp.writeFile(outputPath, tsxCode);
            console.log(`✅ ${fileKey} → ${meta.name}.tsx`);
        })
    );

    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed) {
        console.error(`❌ Generation completed with errors: ${failed}/${results.length} files`);
    }

    const entryPoints = metas.map((meta) => `export * from './${meta.name}';`);
    const names = metas.map((meta) => `'${meta.name}'`);

    const finalManifest = await buildManifest();
    await fsp.writeFile(path.resolve('./manifest.json'), JSON.stringify(finalManifest, null, 2));

    const indexPath = path.join(OUTPUT_DIR, 'index.ts');

    await fsp.writeFile(indexPath, buildEntryFile(entryPoints.join('\n'), names));

    await generateLegacy();

    console.log(`🎉 All SVGs successfully converted to React components!`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    run().catch((err) => {
        console.error('❌ Error during icon generation:', err);
        process.exit(1);
    });
}
