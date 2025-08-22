// @ts-check

import outputComponentsAsSvg from '@figma-export/output-components-as-svg';
import transformSvgWithSvgo from '@figma-export/transform-svg-with-svgo';

import * as dotenv from 'dotenv';
import { config } from './config.mjs';

dotenv.config();

const secondaryZoneColorHex = '#E21D03';

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
                    name: 'preset-default',
                    params: {
                        overrides: {
                            removeViewBox: false
                        }
                    }
                },
                { name: 'removeComments' },
                { name: 'removeXMLNS' },
                { name: 'cleanupIds' },
                { name: 'removeEmptyContainers' },
                {
                    name: 'removeAttrs',
                    params: {
                        attrs: 'stroke|transform'
                    }
                },
                {
                    name: 'replace-values',
                    fn: () => {
                        return {
                            element: {
                                enter: (node) => {
                                    if (node.name === 'svg') {
                                        // - Remove fill from the root, to customize with inner elements
                                        delete node.attributes.fill;
                                    } else if (node.attributes['fill']) {
                                        // - Remove fill from the primary zone.
                                        // - Set secondary zones to fill="currentColor".
                                        if (secondaryZoneColorHex === node.attributes.fill) {
                                            node.attributes.fill = 'currentColor';
                                        } else {
                                            delete node.attributes.fill;
                                        }
                                    }
                                    ['color', 'class'].forEach((attr) => {
                                        if (node.attributes[attr]) {
                                            delete node.attributes[attr];
                                        }
                                    });
                                }
                            }
                        };
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
