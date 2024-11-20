// @ts-check

import outputComponentsAsSvg from '@figma-export/output-components-as-svg';
import transformSvgWithSvgo from '@figma-export/transform-svg-with-svgo';

import * as dotenv from 'dotenv';
import { config } from './config.mjs';

dotenv.config();

/** @type { import('@figma-export/types').ComponentsCommandOptions } */
const componentOptions = {
    token: process.env.FIGMA_TOKEN,
    fileId: config.figmaFile.id,
    concurrency: 5,
    onlyFromPages: [config.figmaFile.page],
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
                    type: 'visitor',
                    name: 'replace-values',
                    fn: () => {
                        return {
                            element: {
                                enter: (node) => {
                                    if (node.name === 'svg') {
                                        node.attributes['fill'] = 'currentColor';
                                    } else if (node.attributes['fill']) {
                                        node.attributes['fill'] = 'currentColor';
                                    }
                                    if (node.attributes['color']) {
                                        delete node.attributes['color'];
                                    }

                                    if (node.attributes['class']) {
                                        delete node.attributes['class'];
                                    }
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
            output: config.output.tempSvg
        })
    ]
};

/** @type { import('@figma-export/types').FigmaExportRC } */
export default {
    commands: [['components', componentOptions]]
};
