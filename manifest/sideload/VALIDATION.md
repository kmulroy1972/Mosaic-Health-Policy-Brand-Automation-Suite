# Manifest Validation Guide

## Summary

✅ **All XML manifests have been validated using `office-addin-manifest@1.10.0`**

The following sideloadable Word manifests are available in this directory:

- `word.dev.xml` - Development environment (https://localhost:3000)
- `word.test.xml` - Test environment (https://test-cdn.mhp.com)
- `word.prod.xml` - Production environment (https://cdn.mhp.com)

## Important Note About Conversion

**There is no automated tool to convert unified JSON manifests to classic XML format.**

The `office-addin-manifest` package (v1.10.0) only supports:

- ✅ XML validation
- ✅ XML modification
- ✅ XML → JSON conversion
- ❌ JSON → XML conversion (not available)

These manifests were **manually created** based on the specifications in `manifest/unified.*.json`.

## How to Validate Manifests

### Validate Individual Manifests

```bash
# Validate development manifest
npx office-addin-manifest validate manifest/sideload/word.dev.xml

# Validate test manifest
npx office-addin-manifest validate manifest/sideload/word.test.xml

# Validate production manifest
npx office-addin-manifest validate manifest/sideload/word.prod.xml
```

### Validate All Manifests at Once

```bash
cd manifest/sideload
for file in word.*.xml; do
  echo "Validating $file..."
  npx office-addin-manifest validate "$file"
  echo ""
done
```

## Expected Validation Results

### ✅ Valid Manifest

```
Package Type Identified: Package of your add-in was parsed successfully.
Valid Manifest Schema: Your manifest does adhere to the current set of XML schema definitions...
...
The manifest is valid.
```

### ❌ Invalid Manifest

```
Error #1:
[Error description]
...
The manifest is not valid.
```

## Current Validation Status

Last validated: October 27, 2025

| Manifest      | Status   | Version |
| ------------- | -------- | ------- |
| word.dev.xml  | ✅ Valid | 1.0.0.0 |
| word.test.xml | ✅ Valid | 1.0.0.0 |
| word.prod.xml | ✅ Valid | 1.0.0.0 |

## Sideloading Instructions

### macOS

1. Open Microsoft Word
2. Go to **Insert** > **Add-ins** > **My Add-ins**
3. Click **Upload My Add-in**
4. Select the appropriate XML file (e.g., `word.dev.xml`)
5. Click **Upload**
6. The add-in will appear in the **Home** ribbon under "MHP Brand"

### Windows

1. Open Microsoft Word
2. Go to **Insert** > **Add-ins** > **My Add-ins**
3. Click **Upload My Add-in**
4. Browse to and select the appropriate XML file
5. Click **Upload**

## Troubleshooting

### Validation Errors

If you encounter validation errors:

1. Check XML syntax (proper opening/closing tags)
2. Verify all required URLs are HTTPS
3. Ensure version number is >= 1.0.0.0
4. Confirm GUID format for `<Id>` element

### Sideloading Issues

If the add-in doesn't load after sideloading:

1. Clear Office cache:

   ```bash
   ./clear-word-cache.sh
   ```

2. Ensure the dev server is running (for dev manifest):

   ```bash
   pnpm dev
   ```

3. Check that URLs in manifest match your environment

## Updating Manifests

When updating unified manifests (`unified.*.json`), remember to:

1. Manually update the corresponding XML files
2. Re-validate using the commands above
3. Test sideloading in Word

## References

- [Office Add-in Manifest Validation](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/troubleshoot-manifest)
- [Sideload Office Add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/test-debug-office-add-ins)
- [office-addin-manifest Package](https://www.npmjs.com/package/office-addin-manifest)
