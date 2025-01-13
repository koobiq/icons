import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Directories and output file
const DEST_DIR = 'dist/images/light';
const URL_PREFIX = './images/light';
const OUTPUT_HTML = 'dist/index.html';

// HTML table styles and header
const HTML_HEADER = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Preview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        table {
            border-collapse: collapse;
        }
        thead {
            position: sticky;
            top: 0;
            box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.1);
            background-color: white;
        }
        th, td {
            border: none;
            padding: 0;
            text-align: center;
        }
        th {
         padding: 0.5em;
        }
        img {
            max-width: 256px;
            height: auto;
        }
        .size {
            opacity: 0.5;
            margin-left: 0.1em;
        }
    </style>
</head>
<body>
    <h1>Empty States Images: PNG, WEbP, AVIF</h1>
    <table>
        <thead>
            <tr>
                <th>PNG</th>
                <th>AVIF</th>
                <th>WebP</th>
            </tr>
        </thead>
        <tbody>
`;

// HTML footer
const HTML_FOOTER = `
        </tbody>
    </table>
</body>
</html>
`;

// Function to find all PNG files in the destination directory
async function findImages(dir) {
    const files = await execAsync(`find ${dir} -type f -name "*.png"`);
    return files.stdout.trim().split('\n');
}

// Function to get file size in KB
async function getFileSize(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return (stats.size / 1024).toFixed(1);
        return stats.size
    } catch (err) {
        console.error(`Error getting size for ${filePath}:`, err);
        return 'N/A';
    }
}

// Function to generate an HTML row for an image
async function generateRow(baseName, isRetina) {
    const retinaLabel = isRetina ? '(Retina)' : '';
    const pngSrc = `${URL_PREFIX}/${baseName}.png`;
    const losslessAvif = `${URL_PREFIX}/${baseName}-lossless.avif`;
    const losslessWebp = `${URL_PREFIX}/${baseName}-lossless.webp`;
    const lossyAvif = `${URL_PREFIX}/${baseName}-lossy75.avif`;
    const lossyWebp = `${URL_PREFIX}/${baseName}-lossy80.webp`;

    // Get file sizes
    const pngSize = await getFileSize(path.join(DEST_DIR, `${baseName}.png`));
    const losslessAvifSize = await getFileSize(path.join(DEST_DIR, `${baseName}-lossless.avif`));
    const losslessWebpSize = await getFileSize(path.join(DEST_DIR, `${baseName}-lossless.webp`));
    const lossyAvifSize = await getFileSize(path.join(DEST_DIR, `${baseName}-lossy75.avif`));
    const lossyWebpSize = await getFileSize(path.join(DEST_DIR, `${baseName}-lossy80.webp`));

    return `
        <tr>
            <td><img src="${pngSrc}" alt="${baseName}"><br>${baseName}.png<div class="size">${pngSize} KB</div></td>
            <td><img src="${losslessAvif}" alt="${baseName}"><br>AVIF Lossless<div class="size">${losslessAvifSize} KB</div></td>
            <td><img src="${losslessWebp}" alt="${baseName}"><br>WebP Lossless<div class="size">${losslessWebpSize} KB</div></td>
        </tr>
        <tr>
            <td><img src="${pngSrc}" alt="${baseName}"><br>${baseName}.png<div class="size">${pngSize} KB</div></td>
            <td><img src="${lossyAvif}" alt="${baseName}"><br>AVIF Lossy Q75<div class="size">${lossyAvifSize} KB</div></td>
            <td><img src="${lossyWebp}" alt="${baseName}"><br>WebP Lossy Q80<div class="size">${lossyWebpSize} KB</div></td>
        </tr>
    `;
}

// Main function to generate the HTML file
async function generateHtml() {
    try {
        // Ensure the output directory exists
        await fs.mkdir(path.dirname(OUTPUT_HTML), { recursive: true });

        // Start writing the HTML file
        await fs.writeFile(OUTPUT_HTML, HTML_HEADER);

        // Find all PNG files
        const pngFiles = await findImages(DEST_DIR);

        // Generate rows for each PNG file
        for (const file of pngFiles) {
            const baseName = path.basename(file, '.png');
            const isRetina = baseName.includes('@2x');
            const row = await generateRow(baseName, isRetina);
            await fs.appendFile(OUTPUT_HTML, row);
        }

        // Append the footer to complete the HTML
        await fs.appendFile(OUTPUT_HTML, HTML_FOOTER);

        console.log(`HTML preview generated at ${OUTPUT_HTML}`);
    } catch (err) {
        console.error('Error generating HTML:', err);
    }
}

// Run the script
generateHtml();
