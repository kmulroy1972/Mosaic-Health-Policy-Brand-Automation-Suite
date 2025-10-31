#!/bin/bash
# Create simple placeholder PNG icons (16x16, 32x32, 64x64, 80x80)
# Using ImageMagick if available, or provide instructions

if command -v convert &> /dev/null; then
  # Create blue square with "M" text
  convert -size 16x16 xc:"#0a5dc2" -pointsize 10 -fill white -gravity center -annotate +0+0 "M" icon-16.png
  convert -size 32x32 xc:"#0a5dc2" -pointsize 16 -fill white -gravity center -annotate +0+0 "M" icon-32.png
  convert -size 64x64 xc:"#0a5dc2" -pointsize 32 -fill white -gravity center -annotate +0+0 "M" icon-64.png
  convert -size 80x80 xc:"#0a5dc2" -pointsize 40 -fill white -gravity center -annotate +0+0 "M" icon-80.png
  echo "Icons created!"
else
  echo "ImageMagick not found. Creating placeholder files..."
  echo "Note: You'll need to create actual PNG icon files (16x16, 32x32, 64x64, 80x80)"
  echo "Or use an online tool like: https://www.favicon-generator.org/"
fi
