// @ts-check

import outputComponentsAsSvg from '@figma-export/output-components-as-svg';
import transformSvgWithSvgo from '@figma-export/transform-svg-with-svgo';

import * as dotenv from 'dotenv';
import { config } from './config.mjs';

dotenv.config();

/**
 * Detects the secondary (two-color) zone by Figma layer name instead of by color.
 *
 * Figma is queried with `svg_include_id: true`, so every layer is exported with an
 * `id` matching its Figma name. By convention the secondary zone layer is named
 * `shape-2` (the primary zone is `shape`). Keying off the layer name keeps the
 * duotone mechanism working regardless of the palette used in Figma — previously we
 * matched a hardcoded hex (`#E21D03`), which silently broke every duotone icon when
 * the zone colors changed in Figma.
 */
const isSecondaryZoneId = (id) => typeof id === 'string' && /^shape-2(?:[-_].*)?$/.test(id);

/** @type { import('@figma-export/types').ComponentsCommandOptions } */
const componentOptions = {
    fileId: config.figmaFile.id,
    concurrency: 5,
    onlyFromPages: config.figmaFile.pages,
    filterComponent: (component) => {
        const name = (component.name || '').trim();
        return !/^[._]/.test(name);
    },
    transformers: [
        transformSvgWithSvgo({
            plugins: [
                {
                    // Runs first, on the raw Figma structure, so layer ids (`shape` /
                    // `shape-2`) are still intact when we decide which zone a node is.
                    name: 'split-zones',
                    fn: () => {
                        // Depth counter: > 0 while we are inside a `shape-2` subtree.
                        let secondaryDepth = 0;
                        return {
                            element: {
                                enter: (node) => {
                                    if (node.name === 'svg') {
                                        // - Remove fill from the root, to customize with inner elements.
                                        delete node.attributes.fill;
                                        return;
                                    }
                                    if (isSecondaryZoneId(node.attributes.id)) {
                                        secondaryDepth++;
                                    }
                                    if (node.attributes['fill']) {
                                        if (secondaryDepth > 0) {
                                            // Secondary zone -> driven by the CSS `color` property.
                                            node.attributes.fill = 'currentColor';
                                        } else {
                                            // Primary zone -> driven by the CSS `fill` property.
                                            delete node.attributes.fill;
                                        }
                                    }
                                    // Figma now bakes colors into an inline `style`
                                    // (semi-transparent P3 palette -> `fill`/`stroke` +
                                    // `*-opacity`). It would override `fill="currentColor"`
                                    // and re-introduce baked transparency, so drop it —
                                    // the design system drives color/opacity via CSS.
                                    ['color', 'class', 'style'].forEach((attr) => {
                                        if (node.attributes[attr]) {
                                            delete node.attributes[attr];
                                        }
                                    });
                                },
                                exit: (node) => {
                                    if (isSecondaryZoneId(node.attributes.id)) {
                                        secondaryDepth--;
                                    }
                                }
                            }
                        };
                    }
                },
                {
                    // `preset-default` also strips the now-unused `shape` / `shape-2`
                    // ids (cleanupIds), while keeping ids still referenced by url(#...).
                    name: 'preset-default',
                    params: {
                        overrides: {
                            removeViewBox: false
                        }
                    }
                },
                { name: 'removeComments' },
                { name: 'removeEmptyContainers' },
                {
                    // `fill-opacity` is stripped so zone colors stay solid: Figma now
                    // applies 0.85/0.75 opacity to the zones, but the design system
                    // controls transparency via CSS, not baked into the SVG.
                    name: 'removeAttrs',
                    params: {
                        attrs: 'stroke|transform|fill-opacity'
                    }
                }
            ]
        })
    ],
    outputters: [
        outputComponentsAsSvg({
            output: config.output.tempSvg,
            getDirname: ({ pageName }) => pageName
        })
    ]
};

/** @type { import('@figma-export/types').FigmaExportRC } */
export default {
    commands: [['components', componentOptions]]
};
