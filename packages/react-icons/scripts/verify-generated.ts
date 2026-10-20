import { promises as fsp } from 'fs';
import path from 'node:path';

import ts from 'typescript';

import type { IconMeta, LegacyIconMeta } from './lib/icon-meta';
import { getLegacyMetas, parseIconKey } from './lib/icon-meta';

const INPUT_DIR = path.resolve('../icons/svg');
const MANIFEST_FILE = path.resolve('../../mapping.json');
const INTEROP_FILE = path.resolve('../../mapping-interop.json');
const OUTPUT_DIR = path.resolve('./src');
const LEGACY_DIR = path.join(OUTPUT_DIR, 'legacy');

function readSourceSvgAttrs(svgSource: string): { width?: string; height?: string; viewBox?: string } {
    return {
        width: svgSource.match(/\bwidth="([^"]+)"/)?.[1],
        height: svgSource.match(/\bheight="([^"]+)"/)?.[1],
        viewBox: svgSource.match(/\bviewBox="([^"]+)"/)?.[1]
    };
}

function parseSource(filePath: string, text: string): ts.SourceFile {
    return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function findExportedConst(sf: ts.SourceFile, name: string): ts.VariableDeclaration | undefined {
    let found: ts.VariableDeclaration | undefined;

    for (const node of sf.statements) {
        if (!ts.isVariableStatement(node)) continue;
        if (!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;

        for (const decl of node.declarationList.declarations) {
            if (ts.isIdentifier(decl.name) && decl.name.text === name) found = decl;
        }
    }

    return found;
}

function findJsxOpeningElement(node: ts.Node): ts.JsxOpeningElement | ts.JsxSelfClosingElement | undefined {
    let result: ts.JsxOpeningElement | ts.JsxSelfClosingElement | undefined;

    const visit = (n: ts.Node) => {
        if (result) return;

        if (ts.isJsxElement(n)) {
            result = n.openingElement;
            return;
        }

        if (ts.isJsxSelfClosingElement(n)) {
            result = n;
            return;
        }

        n.forEachChild(visit);
    };

    visit(node);

    return result;
}

function getAttr(attrs: ts.JsxAttributes, name: string): ts.JsxAttribute | undefined {
    return attrs.properties.find((p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === name);
}

function attrValueText(attr: ts.JsxAttribute | undefined): string | undefined {
    if (!attr) return undefined;
    if (!attr.initializer) return 'true';
    if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;

    if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
        const expr = attr.initializer.expression;

        if (ts.isNumericLiteral(expr) || ts.isStringLiteral(expr) || ts.isIdentifier(expr)) return expr.text;
    }

    return undefined;
}

function hasPropsSpread(attrs: ts.JsxAttributes): boolean {
    return attrs.properties.some((p) => ts.isJsxSpreadAttribute(p) && /\bprops\b/.test(p.expression.getText()));
}

type Options = {
    dir: string;
    sourceSvgKey: string;
    expectedDeprecatedFor?: string;
};

function verifyComponent(meta: IconMeta, text: string, sourceSvg: string, opts: Options): string[] {
    const problems: string[] = [];
    const filePath = path.join(opts.dir, `${meta.name}.tsx`);
    const sf = parseSource(filePath, text);

    const decl = findExportedConst(sf, meta.name);

    if (!decl) {
        return [`${meta.name}: no "export const ${meta.name} = ..." declaration found`];
    }

    const init = decl.initializer;
    const isForwardRefCall = init && ts.isCallExpression(init) && init.expression.getText() === 'forwardRef';

    if (!isForwardRefCall) {
        problems.push(`${meta.name}: initializer is not a forwardRef(...) call`);
    }

    const opening = init && findJsxOpeningElement(init);

    if (!opening) {
        problems.push(`${meta.name}: no JSX element found inside forwardRef`);
    } else {
        const tag = opening.tagName.getText();

        if (tag !== 'svg') problems.push(`${meta.name}: root element is <${tag}>, expected <svg>`);

        const attrs = opening.attributes;
        const fill = attrValueText(getAttr(attrs, 'fill'));

        if (fill !== 'currentColor') problems.push(`${meta.name}: fill="${fill}", expected "currentColor"`);

        if (!getAttr(attrs, 'ref')) problems.push(`${meta.name}: missing ref prop`);
        if (!hasPropsSpread(attrs)) problems.push(`${meta.name}: missing {...props} spread`);

        if (!getAttr(attrs, 'xmlns')) problems.push(`${meta.name}: missing xmlns`);

        const sourceAttrs = readSourceSvgAttrs(sourceSvg);
        const width = attrValueText(getAttr(attrs, 'width'));
        const height = attrValueText(getAttr(attrs, 'height'));
        const viewBox = attrValueText(getAttr(attrs, 'viewBox'));

        if (width !== sourceAttrs.width) {
            problems.push(`${meta.name}: width="${width}", source svg has width="${sourceAttrs.width}"`);
        }

        if (height !== sourceAttrs.height) {
            problems.push(`${meta.name}: height="${height}", source svg has height="${sourceAttrs.height}"`);
        }

        if (viewBox !== sourceAttrs.viewBox) {
            problems.push(`${meta.name}: viewBox="${viewBox}", source svg has viewBox="${sourceAttrs.viewBox}"`);
        }
    }

    const hasDisplayName = sf.statements.some(
        (s) =>
            ts.isExpressionStatement(s) &&
            ts.isBinaryExpression(s.expression) &&
            s.expression.left.getText() === `${meta.name}.displayName` &&
            ts.isStringLiteral(s.expression.right) &&
            s.expression.right.text === meta.name
    );

    if (!hasDisplayName) {
        problems.push(`${meta.name}: missing "${meta.name}.displayName = '${meta.name}'"`);
    }

    const deprecatedMatch = text.match(/@deprecated[\s\S]*?please use (\w+) instead/);

    if (opts.expectedDeprecatedFor) {
        if (!deprecatedMatch) {
            problems.push(`${meta.name}: missing @deprecated notice`);
        } else if (deprecatedMatch[1] !== opts.expectedDeprecatedFor) {
            problems.push(
                `${meta.name}: @deprecated notice points to ${deprecatedMatch[1]}, expected ${opts.expectedDeprecatedFor}`
            );
        }
    } else if (deprecatedMatch) {
        problems.push(`${meta.name}: unexpected @deprecated notice on a non-legacy component`);
    }

    return problems;
}

async function verifyOne(meta: IconMeta, opts: Options): Promise<string[]> {
    const filePath = path.join(opts.dir, `${meta.name}.tsx`);

    let text: string;
    let sourceSvg: string;

    try {
        text = await fsp.readFile(filePath, 'utf8');
    } catch {
        return [`${meta.name}: missing generated file ${filePath}`];
    }

    try {
        sourceSvg = await fsp.readFile(path.join(INPUT_DIR, `${opts.sourceSvgKey}.svg`), 'utf8');
    } catch {
        return [`${meta.name}: missing source SVG ${opts.sourceSvgKey}.svg`];
    }

    return verifyComponent(meta, text, sourceSvg, opts);
}

async function verifyIndex(metas: IconMeta[]): Promise<string[]> {
    const problems: string[] = [];
    const indexPath = path.join(OUTPUT_DIR, 'index.ts');
    const text = await fsp.readFile(indexPath, 'utf8').catch(() => '');

    if (!text) return [`missing ${indexPath}`];

    for (const meta of metas) {
        if (!text.includes(`export * from './${meta.name}';`)) {
            problems.push(`src/index.ts: missing export for ${meta.name}`);
        }

        if (!text.includes(`'${meta.name}'`)) {
            problems.push(`src/index.ts: IconName union is missing ${meta.name}`);
        }
    }

    if (!text.includes(`export * from './legacy';`)) {
        problems.push(`src/index.ts: missing "export * from './legacy'"`);
    }

    return problems;
}

async function verifyLegacyIndex(legacyMetas: LegacyIconMeta[]): Promise<string[]> {
    const indexPath = path.join(LEGACY_DIR, 'index.ts');
    const text = await fsp.readFile(indexPath, 'utf8').catch(() => '');

    if (!text) return [`missing ${indexPath}`];

    const expected = legacyMetas.map((meta) => `export * from './${meta.name}';`);
    const actual = text.trim().split('\n');

    if (actual.join('\n') !== expected.join('\n')) {
        return [`src/legacy/index.ts: exports do not match expected legacy set (order/content mismatch)`];
    }

    return [];
}

async function main() {
    const iconsInfo: Record<string, unknown> = JSON.parse(await fsp.readFile(MANIFEST_FILE, 'utf8'));
    const metas: IconMeta[] = Object.keys(iconsInfo)
        .filter((key) => key !== '$schema')
        .map(parseIconKey);

    const interop: Record<string, string> = JSON.parse(await fsp.readFile(INTEROP_FILE, 'utf8'));
    const legacyMetas = getLegacyMetas(interop);

    const problems: string[] = [];

    for (const meta of metas) {
        problems.push(...(await verifyOne(meta, { dir: OUTPUT_DIR, sourceSvgKey: meta.key })));
    }

    for (const meta of legacyMetas) {
        problems.push(
            ...(await verifyOne(meta, {
                dir: LEGACY_DIR,
                sourceSvgKey: meta.newKey,
                expectedDeprecatedFor: parseIconKey(meta.newKey).name
            }))
        );
    }

    problems.push(...(await verifyIndex(metas)));
    problems.push(...(await verifyLegacyIndex(legacyMetas)));

    if (problems.length) {
        console.error(`❌ Generated react-icons failed verification (${problems.length} problem(s)):`);
        problems.forEach((p) => console.error(`  - ${p}`));
        process.exit(1);
    }

    console.log(`✅ Verified ${metas.length} components + ${legacyMetas.length} legacy aliases`);
}

main().catch((err) => {
    console.error('❌ Error during generated react-icons verification:', err);
    process.exit(1);
});
