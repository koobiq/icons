#!/bin/bash

# Define the directory containing the images
DEST_DIR="dist/images/light"
OUTPUT_HTML="dist/index.html"

# Create the HTML file and write the basic structure
cat <<EOF > "$OUTPUT_HTML"
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
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f4f4f4;
        }
        img {
            max-width: 200px;
            height: auto;
        }
    </style>
</head>
<body>
    <h1>Image Preview</h1>
    <table>
        <thead>
            <tr>
                <th>Original PNG</th>
                <th>Lossless AVIF</th>
                <th>Lossless WebP</th>
                <th>Lossy AVIF</th>
                <th>Lossy WebP</th>
            </tr>
        </thead>
        <tbody>
EOF

# Iterate over all PNG files and generate table rows
find "$DEST_DIR" -type f -name "*.png" | while read -r png_file; do
    # Get the base filename without extension
    base_name=$(basename "$png_file" .png)

    # Check for retina (@2x) images
    is_retina=""
    if [[ "$base_name" == *@2x ]]; then
        is_retina="(Retina)"
    fi

    # Define paths for converted images (add leading slash to all paths)
    png_src="/${png_file}"
    lossless_avif="/${DEST_DIR}/${base_name}-lossless.avif"
    lossless_webp="/${DEST_DIR}/${base_name}-lossless.webp"
    lossy_avif="/${DEST_DIR}/${base_name}-lossy75.avif"
    lossy_webp="/${DEST_DIR}/${base_name}-lossy80.webp"

    # Write a row for the image
    cat <<EOF >> "$OUTPUT_HTML"
            <tr>
                <td><img src="${png_src}" alt="${base_name}"><br>${base_name}.png $is_retina</td>
                <td><img src="${lossless_avif}" alt="${base_name}"><br>${base_name}-lossless.avif</td>
                <td><img src="${lossless_webp}" alt="${base_name}"><br>${base_name}-lossless.webp</td>
                <td><img src="${lossy_avif}" alt="${base_name}"><br>${base_name}-lossy75.avif</td>
                <td><img src="${lossy_webp}" alt="${base_name}"><br>${base_name}-lossy80.webp</td>
            </tr>
EOF
done

# Close the HTML structure
cat <<EOF >> "$OUTPUT_HTML"
        </tbody>
    </table>
</body>
</html>
EOF

echo "HTML preview generated at $OUTPUT_HTML"
