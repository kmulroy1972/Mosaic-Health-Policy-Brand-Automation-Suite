# Manifest Conversion Note

## Important: No Automated Conversion Tool Available

As of `office-addin-manifest@1.10.0`, **there is no official tool to convert unified (JSON) manifests to classic XML format**. The `office-addin-manifest` tool only supports:

- **XML → JSON conversion** (not JSON → XML)
- Validation of existing XML manifests
- Modification of existing XML manifests
- Exporting manifest packages

## Current XML Manifests

The XML manifests in this directory were **manually created** based on the unified manifest specifications in `manifest/unified.*.json`:

- `word.dev.xml` - Development environment (localhost:3000)
- `word.test.xml` - Test environment (test-cdn.mhp.com)
- `word.prod.xml` - Production environment (cdn.mhp.com)

## Validation

To validate any XML manifest:

```bash
# Validate development manifest
npx office-addin-manifest validate manifest/sideload/word.dev.xml

# Validate test manifest
npx office-addin-manifest validate manifest/sideload/word.test.xml

# Validate production manifest
npx office-addin-manifest validate manifest/sideload/word.prod.xml
```

### Expected Output

✅ **Valid manifest:**

```
The manifest is valid.
```

❌ **Invalid manifest:**

```
Error #1: [Error description]
...
The manifest is not valid.
```

## Updating XML Manifests

When you update the unified manifests (`unified.*.json`), you must **manually update** the corresponding XML files to reflect the changes:

### Key mappings from unified to XML:

| Unified JSON                                         | XML Equivalent                                      |
| ---------------------------------------------------- | --------------------------------------------------- |
| `id`                                                 | `<Id>`                                              |
| `version`                                            | `<Version>`                                         |
| `displayName.default`                                | `<DisplayName DefaultValue="">`                     |
| `description.default`                                | `<Description DefaultValue="">`                     |
| `extensions[0].resources[0].resource` (Taskpane.Url) | `<SourceLocation>` and `<bt:Url id="Taskpane.Url">` |
| `webApplicationInfo.id`                              | SSO configuration (optional)                        |

## Alternative: Use Unified Manifest Directly

For modern Office deployments (Microsoft 365), consider deploying the unified manifest directly instead of converting to XML:

- Upload `unified.*.json` to Microsoft 365 admin center
- Unified manifests support all Office applications in a single file
- No XML conversion required

## References

- [Office Add-ins Manifest Documentation](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/add-in-manifests)
- [Unified Manifest for Office Add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/unified-manifest-overview)
- [office-addin-manifest npm package](https://www.npmjs.com/package/office-addin-manifest)
