#!/bin/bash
# Create placeholder icon files for Office Add-in

ASSETS_DIR="/Users/kylemulroy/mosaic-design/apps/dev-host/public/assets"

echo "Creating placeholder icons in $ASSETS_DIR..."

# Create 16x16 icon (blue square with M)
convert -size 16x16 xc:"#0078d4" \
  -gravity center -pointsize 12 -fill white -annotate +0+0 "M" \
  "$ASSETS_DIR/icon-16.png" 2>/dev/null || \
  echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABdSURBVDiN7ZMxCgAgDATvpf//ZxdRcHAQB0EQBBEVtVLEQopgm6WEXJKbC8MwDMMwDMMwDMMwDMMwDMMw/gNYA1iDWINYg1iDWINYg1iDWINYg1iDWINYg1iDWMM3eADSdwSO8QAAAABJRU5ErkJggg==" | base64 -d > "$ASSETS_DIR/icon-16.png"

# Create 32x32 icon (blue square with MHP)
convert -size 32x32 xc:"#0078d4" \
  -gravity center -pointsize 16 -fill white -annotate +0+0 "MHP" \
  "$ASSETS_DIR/icon-32.png" 2>/dev/null || \
  echo "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsAAAALAAjfB8TAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACNSURBVFiF7ZYxCsAgDEVf7v3vbCciDg4OgiAIgqBQFRVLEQspgm0pJeSSvFwYhmEYhmEYhmEYhmEYhmEYhmEY/wVsAGsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQG/gAXnQEjvG7YAAAAABJRU5ErkJggg==" | base64 -d > "$ASSETS_DIR/icon-32.png"

# Create 64x64 icon
convert -size 64x64 xc:"#0078d4" \
  -gravity center -pointsize 32 -fill white -annotate +0+0 "MHP" \
  "$ASSETS_DIR/icon-64.png" 2>/dev/null || \
  echo "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABYgAAAWIBXyfQUwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACdSURBVHic7doxCsAgDEDRl3v/O9uJiIODgyAIgiAoVEXFUsRCimBbSgm5JC8XhmEYhmEYhmEYhmEYhmEYhmEY/wVsAGsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQG/gAXnQEjvG7YAAAAABJRU5ErkJggg==" | base64 -d > "$ASSETS_DIR/icon-64.png"

# Create 80x80 icon
convert -size 80x80 xc:"#0078d4" \
  -gravity center -pointsize 40 -fill white -annotate +0+0 "MHP" \
  "$ASSETS_DIR/icon-80.png" 2>/dev/null || \
  echo "iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABdgAAAXYBqDl46wAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACxSURBVHic7doxCsAgDEDRl3v/O9uJiIODgyAIgiAoVEXFUsRCimBbSgm5JC8XhmEYhmEYhmEYhmEYhmEYhmEY/wVsAGsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQGxAbEBsQG/gAXnQEjvG7YAAAAABJRU5ErkJggg==" | base64 -d > "$ASSETS_DIR/icon-80.png"

echo ""
echo "✅ Placeholder icons created!"
echo ""
echo "Files created:"
ls -lh "$ASSETS_DIR"/*.png 2>/dev/null || echo "Note: ImageMagick not installed, using base64-encoded fallback PNGs"
echo ""
echo "These are temporary placeholders. Replace with real MHP brand icons before production."

