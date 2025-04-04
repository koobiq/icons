import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFiles = async (dirPath, arrayOfFiles = []) => {
    const entries = await fs.readdir(dirPath);

    for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const entryStat = await fs.stat(fullPath);
        if (entryStat.isDirectory()) {
            await getFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push({ path: fullPath, fileName: entry });
        }
    }

    return arrayOfFiles;
};

const copyIcons = async (destPath, svgDir) => {
    const iconsList = await getFiles(svgDir);

    for (const item of iconsList) {
        const destFilePath = join(destPath, item.fileName);
        await fs.copy(item.path, destFilePath);
    }
};

const main = async () => {
    const destDir = join(__dirname, '../src/svg');
    const svgDir = join(__dirname, `../${config.output.tempSvg}/${config.figmaFile.page}`);

    try {
        // Remove and create the destination directory
        await fs.remove(destDir);
        await fs.ensureDir(destDir);

        // Copy icons and info file
        await copyIcons(destDir, svgDir);

        console.log('Files successfully copied.');
    } catch (error) {
        console.error('Error executing the script:', error);
        process.exit(1);
    }
};

(async () => {
    await main();
})();
