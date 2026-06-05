import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

const SRC_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(__dirname, '../../../dist/packages/visuals');

async function findPngFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.png')) {
            results.push(path.join(entry.parentPath, entry.name));
        }
    }
    return results;
}

async function convertToWebp(srcPng: string, destWebp: string): Promise<void> {
    await fs.mkdir(path.dirname(destWebp), { recursive: true });
    await execAsync(`cwebp -near_lossless 80 "${srcPng}" -o "${destWebp}"`);
}

async function getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
}

async function main() {
    const pngFiles = await findPngFiles(SRC_DIR);

    if (pngFiles.length === 0) {
        console.log('No PNG files found for conversion.');
        return;
    }

    let totalPngSize = 0;
    let totalWebpSize = 0;

    for (const pngFile of pngFiles) {
        const relative = path.relative(SRC_DIR, pngFile);
        const destWebp = path.join(DIST_DIR, relative.replace(/\.png$/, '.webp'));

        await convertToWebp(pngFile, destWebp);

        const pngSize = await getFileSize(pngFile);
        const webpSize = await getFileSize(destWebp);

        totalPngSize += pngSize;
        totalWebpSize += webpSize;
    }

    const count = pngFiles.length;
    const avgPngSize = Math.round(totalPngSize / count);
    const avgWebpSize = Math.round(totalWebpSize / count);
    const compressionRatio = (100 * (1 - avgWebpSize / avgPngSize)).toFixed(2);

    console.log(`Count: ${count}`);
    console.log('===============================');
    console.log(' Image Format Compression Report ');
    console.log('===============================');
    console.log(`Average PNG Size: ${avgPngSize} bytes`);
    console.log(`Average WebP Size: ${avgWebpSize} bytes`);
    console.log('');
    console.log(`WebP Compression Ratio: ${compressionRatio}%`);
    console.log('Conversion complete!');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
