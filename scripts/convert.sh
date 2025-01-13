#!/bin/bash

# Define source and destination directories
SRC_DIR="src/images"
DEST_DIR="dist/images"

# Check if the directory exists before attempting to delete it
if [ -d "$DEST_DIR" ]; then
    # Remove the output directory and all its contents
    rm -rf "$DEST_DIR"
    echo "Deleted $DEST_DIR"
else
    echo "$DEST_DIR does not exist."
    # Create destination directory if it doesn't exist
    mkdir -p "$DEST_DIR"
fi

# Initialize variables for size calculations
total_png_size=0
total_webp_size=0
total_lossless_webp_size=0
count=0

# Find all PNG files in the source directory
find "$SRC_DIR" -type f -name "*.png" | while read -r file; do
    # Get the relative path of the file
    relative_path="${file#$SRC_DIR/}"

    # Create the corresponding directory structure in the destination directory
    mkdir -p "$DEST_DIR/$(dirname "$relative_path")"

    # Copy the original PNG file to the destination directory
    cp "$file" "$DEST_DIR/$relative_path"

    # Convert to Lossy WebP = and save it in the destination directory
    webp_file="$DEST_DIR/${relative_path%.png}-lossy80.webp"
    cwebp -near_lossless 80 "$file" -o "$webp_file"

    # Convert to lossless WebP and save it in the destination directory with a -lossless suffix
    lossless_webp_file="$DEST_DIR/${relative_path%.png}-lossless.webp"
    cwebp -lossless "$file" -o "$lossless_webp_file"

    # Convert lossless AVIF using ImageMagick with a -lossless suffix
    lossless_avif_file="$DEST_DIR/${relative_path%.png}-lossless.avif"
    magick "$file" -quality 100 "$lossless_avif_file"

    # Convert lossy AVIF using ImageMagick
    avif_file="$DEST_DIR/${relative_path%.png}-lossy75.avif"
    magick "$file" -quality 75 "$avif_file"

    # Calculate sizes using stat with correct options for macOS
    png_size=$(stat -f "%z" "$file")
    webp_size=$(stat -f "%z" "$webp_file")
    lossless_webp_size=$(stat -f "%z" "$lossless_webp_file")

    total_png_size=$((total_png_size + png_size))
    total_webp_size=$((total_webp_size + webp_size))
    total_lossless_webp_size=$((total_lossless_webp_size + lossless_webp_size))

    count=$((count+1))
done


echo "Count: $count" # Print the number of files found

# Calculate average sizes and compression ratios
if [ $count -gt 0 ]; then
    avg_png_size=$((total_png_size / count))
    avg_webp_size=$((total_webp_size / count))
    avg_lossless_webp_size=$((total_lossless_webp_size / count))

    webp_compression_ratio=$(echo "scale=2; 100 * (1 - $avg_webp_size / $avg_png_size)" | bc)
    lossless_webp_compression_ratio=$(echo "scale=2; 100 * (1 - $avg_lossless_webp_size / $avg_png_size)" | bc)

    # Print report
    echo "==============================="
    echo " Image Format Compression Report "
    echo "==============================="
    echo "Average PNG Size: $avg_png_size bytes"
    echo "Average WebP Size: $avg_webp_size bytes"
    echo "Average Lossless WebP Size: $avg_lossless_webp_size bytes"
    echo ""
    echo "WebP Compression Ratio: $webp_compression_ratio%"
    echo "Lossless WebP Compression Ratio: $lossless_webp_compression_ratio%"
else
    echo "No PNG files found for conversion."
fi

echo "Conversion complete!"
