import * as fs from 'fs';
import * as path from 'path';

import ts from 'typescript';

import { toKebab, toPascalCase } from './lib/icon-name';

const SVG_SOURCE_DIR = path.join(path.dirname(require.resolve('@koobiq/icons/package.json')), 'svg');
const OUTPUT_DIR = path.resolve(__dirname, '../icons');
const PUBLIC_API_PATH = path.resolve(__dirname, '../public-api.ts');

function readSourceSvgAttrs(svgSource: string): { width?: string; height?: string; viewBox?: string } {
    return {
        width: svgSource.match(/\bwidth="([^"]+)"/)?.[1],
        height: svgSource.match(/\bheight="([^"]+)"/)?.[1],
        viewBox: svgSource.match(/\bviewBox="([^"]+)"/)?.[1]
    };
}

function findComponentClass(sf: ts.SourceFile, className: string): ts.ClassDeclaration | undefined {
    for (const node of sf.statements) {
        if (ts.isClassDeclaration(node) && node.name?.text === className) return node;
    }

    return undefined;
}

function getComponentDecoratorArg(cls: ts.ClassDeclaration): ts.ObjectLiteralExpression | undefined {
    const modifiers = ts.canHaveDecorators(cls) ? ts.getDecorators(cls) : undefined;

    for (const decorator of modifiers ?? []) {
        if (!ts.isCallExpression(decorator.expression)) continue;
        if (decorator.expression.expression.getText() !== 'Component') continue;

        const [arg] = decorator.expression.arguments;

        if (arg && ts.isObjectLiteralExpression(arg)) return arg;
    }

    return undefined;
}

function getProp(obj: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
    for (const prop of obj.properties) {
        if (ts.isPropertyAssignment(prop) && prop.name.getText().replace(/^['"]|['"]$/g, '') === name) {
            return prop.initializer;
        }
    }

    return undefined;
}

function literalText(expr: ts.Expression | undefined): string | undefined {
    if (!expr) return undefined;
    if (ts.isStringLiteralLike(expr)) return expr.text;
    if (ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;

    return undefined;
}

function verifyComponent(
    file: string,
    text: string,
    expected: { className: string; attrSelector: string; sourceSvg: string }
): string[] {
    const problems: string[] = [];
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    const cls = findComponentClass(sf, expected.className);

    if (!cls) {
        return [`${expected.className}: no "export class ${expected.className} {}" declaration found`];
    }

    const decoratorArg = getComponentDecoratorArg(cls);

    if (!decoratorArg) {
        return [`${expected.className}: no @Component({...}) decorator found`];
    }

    const standalone = getProp(decoratorArg, 'standalone');

    if (standalone?.kind !== ts.SyntaxKind.TrueKeyword) {
        problems.push(`${expected.className}: standalone is not true`);
    }

    const selector = literalText(getProp(decoratorArg, 'selector'));
    const expectedSelector = `svg[${expected.attrSelector}]`;

    if (selector !== expectedSelector) {
        problems.push(`${expected.className}: selector="${selector}", expected "${expectedSelector}"`);
    }

    const template = literalText(getProp(decoratorArg, 'template'));

    if (template === undefined) {
        problems.push(`${expected.className}: no template found`);
    } else if (/<svg[\s>]/.test(template)) {
        problems.push(`${expected.className}: template contains a literal <svg> tag, expected inner content only`);
    }

    const hostExpr = getProp(decoratorArg, 'host');

    if (!hostExpr || !ts.isObjectLiteralExpression(hostExpr)) {
        problems.push(`${expected.className}: no host object found`);
    } else {
        const className = literalText(getProp(hostExpr, 'class'));
        const ariaHidden = literalText(getProp(hostExpr, 'aria-hidden'));
        const xmlns = literalText(getProp(hostExpr, 'xmlns'));

        if (className !== 'kbq-svg-icon') problems.push(`${expected.className}: host.class="${className}"`);
        if (ariaHidden !== 'true') problems.push(`${expected.className}: host.aria-hidden="${ariaHidden}"`);
        if (xmlns !== 'http://www.w3.org/2000/svg') problems.push(`${expected.className}: host.xmlns="${xmlns}"`);

        const sourceAttrs = readSourceSvgAttrs(expected.sourceSvg);
        const viewBox = literalText(getProp(hostExpr, 'viewBox'));
        const width = literalText(getProp(hostExpr, 'width'));
        const height = literalText(getProp(hostExpr, 'height'));

        if (viewBox !== sourceAttrs.viewBox) {
            problems.push(
                `${expected.className}: host.viewBox="${viewBox}", source svg has viewBox="${sourceAttrs.viewBox}"`
            );
        }

        if (width !== sourceAttrs.width) {
            problems.push(`${expected.className}: host.width="${width}", source svg has width="${sourceAttrs.width}"`);
        }

        if (height !== sourceAttrs.height) {
            problems.push(
                `${expected.className}: host.height="${height}", source svg has height="${sourceAttrs.height}"`
            );
        }
    }

    const encapsulation = getProp(decoratorArg, 'encapsulation')?.getText();
    const changeDetection = getProp(decoratorArg, 'changeDetection')?.getText();

    if (encapsulation !== 'ViewEncapsulation.None') {
        problems.push(`${expected.className}: encapsulation="${encapsulation}", expected "ViewEncapsulation.None"`);
    }

    if (changeDetection !== 'ChangeDetectionStrategy.OnPush') {
        problems.push(
            `${expected.className}: changeDetection="${changeDetection}", expected "ChangeDetectionStrategy.OnPush"`
        );
    }

    return problems;
}

async function main() {
    const files = fs
        .readdirSync(SVG_SOURCE_DIR)
        .filter((f) => f.endsWith('.svg'))
        .sort();

    const publicApiText = fs.readFileSync(PUBLIC_API_PATH, 'utf-8');
    const problems: string[] = [];

    for (const file of files) {
        const name = file.replace('.svg', '');
        const kebab = toKebab(name);
        const pascal = toPascalCase(kebab);
        const className = `Kbq${pascal}`;
        const attrSelector = `kbq${pascal}`;
        const outputPath = path.join(OUTPUT_DIR, `${kebab}.ts`);

        let text: string;

        try {
            text = fs.readFileSync(outputPath, 'utf-8');
        } catch {
            problems.push(`${className}: missing generated file ${outputPath}`);
            continue;
        }

        const sourceSvg = fs.readFileSync(path.join(SVG_SOURCE_DIR, file), 'utf-8');

        problems.push(...verifyComponent(outputPath, text, { className, attrSelector, sourceSvg }));

        if (!publicApiText.includes(`export * from './icons/${kebab}';`)) {
            problems.push(`public-api.ts: missing export for ./icons/${kebab}`);
        }
    }

    if (problems.length) {
        console.error(`❌ Generated angular-icons failed verification (${problems.length} problem(s)):`);
        problems.forEach((p) => console.error(`  - ${p}`));
        process.exit(1);
    }

    console.log(`✅ Verified ${files.length} components`);
}

main().catch((err) => {
    console.error('❌ Error during generated angular-icons verification:', err);
    process.exit(1);
});
