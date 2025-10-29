# Icon Assets

This directory contains icon assets for the Office Add-in manifest.

## Required Icons

The manifest references the following icon sizes:

- **icon-16.png** - 16x16 pixels - Ribbon icon (small)
- **icon-32.png** - 32x32 pixels - Standard icon
- **icon-64.png** - 64x64 pixels - High resolution icon
- **icon-80.png** - 80x80 pixels - Large ribbon icon

## Icon Requirements

### Format

- File type: PNG with transparency
- Color mode: RGB or RGBA
- Bit depth: 24-bit or 32-bit (with alpha channel)

### Design Guidelines

- Simple, recognizable design
- Works well at all sizes (16px to 80px)
- Brand colors from MHP style guide
- Clear on both light and dark backgrounds
- Transparent background recommended

### Current Status

⚠️ Placeholder icons needed - create and deploy before production release

### How to Deploy Icons

Once icons are created:

1. Place PNG files in this directory
2. Commit changes: `git add apps/dev-host/public/assets/`
3. Push and tag: `git tag v0.3.0 && git push origin v0.3.0`
4. Icons automatically deploy to cdn.mosaicpolicy.com/assets/

## Temporary Placeholder

For development, you can use placeholder icons:

- Download from: https://via.placeholder.com/16.png
- Or create simple colored squares in your image editor
- Replace with real brand icons before production
