# Word Sideload Manifests

This directory contains classic XML manifests generated from the unified manifests for sideloading in Word desktop.

## Files

- `word.dev.xml` - Development environment manifest (localhost:3000)
- `word.test.xml` - Test environment manifest (test-cdn.mhp.com)
- `word.prod.xml` - Production environment manifest (cdn.mhp.com)

## How to Sideload in Word

### Windows

1. Open Word
2. Go to **Insert** > **Add-ins** > **My Add-ins**
3. Click **Upload My Add-in**
4. Browse to and select the appropriate XML file (e.g., `word.dev.xml`)
5. Click **Upload**

### macOS

1. Open Word
2. Go to **Insert** > **Add-ins** > **My Add-ins**
3. Click **Upload My Add-in**
4. Browse to and select the appropriate XML file (e.g., `word.dev.xml`)
5. Click **Upload**

### Word Online

1. Open a document in Word Online
2. Go to **Insert** > **Add-ins** > **Upload My Add-in**
3. Browse to and select the appropriate XML file
4. Click **Upload**

## Notes

- These manifests were generated from the unified manifest files in the parent `manifest/` directory
- The development manifest (`word.dev.xml`) points to `https://cdn.mosaicpolicy.com`
- SSO configuration (WebApplicationInfo) has been omitted for simplified sideloading
- All manifests use version 1.0.0.0 to meet Office Add-in validation requirements

## Regenerating Manifests

Since there's no automated tool to convert from unified JSON to classic XML format, these manifests were created manually based on the unified manifest structure. If you need to update them:

1. Update the corresponding unified manifest file (`unified.dev.json`, etc.)
2. Manually update the XML manifest to reflect the changes
3. Validate using: `npx office-addin-manifest validate manifest/sideload/word.{env}.xml`

## Validation

To validate a manifest:

```bash
npx office-addin-manifest validate manifest/sideload/word.dev.xml
```

All manifests should pass validation before sideloading.
