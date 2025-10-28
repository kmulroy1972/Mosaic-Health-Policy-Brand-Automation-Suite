# Development Setup Guide

## First-Time Setup for Word Add-in Development

### Step 1: Install Development Certificates

Office Add-ins require HTTPS even for localhost. Install the development certificates:

```bash
pnpm run dev:certs
```

**Note:** This will prompt for your admin password to install the certificate authority on your machine.

Alternatively, you can run directly:

```bash
npx office-addin-dev-certs install --machine
```

### Step 2: Build the Project

```bash
pnpm build
```

### Step 3: Start the Development Server

```bash
pnpm dev
```

The dev server will start on `https://cdn.mosaicpolicy.com` (note: HTTPS, not HTTP).

### Step 4: Sideload in Word

1. Open Microsoft Word (desktop application)
2. Go to **Insert** > **Add-ins** > **My Add-ins**
3. Click **Upload My Add-in**
4. Browse to `manifest/sideload/word.dev.xml`
5. Click **Upload**

The add-in should now load in Word with the taskpane pointing to your local dev server.

## Troubleshooting

### "localhost refused to connect"

**Cause:** The dev server isn't running.

**Solution:** Run `pnpm dev` to start the server.

### Certificate errors or "not secure" warnings

**Cause:** Development certificates not installed or not trusted.

**Solution:**

1. Run `pnpm run dev:certs` to install certificates
2. Verify certificates exist: `ls ~/.office-addin-dev-certs`
3. Restart Word after installing certificates

### Port 3000 already in use

**Cause:** Another process is using port 3000.

**Solution:**

- Find and stop the process: `lsof -ti:3000 | xargs kill`
- Or change the port: `PORT=3001 pnpm dev`
- Update the manifest's URLs accordingly

### Add-in doesn't appear after sideloading

**Cause:** Manifest validation issues or caching.

**Solution:**

1. Validate manifest: `npx office-addin-manifest validate manifest/sideload/word.dev.xml`
2. Clear Office cache (varies by OS)
3. Restart Word

## Development Workflow

1. Make code changes in `packages/` or `apps/`
2. Run `pnpm build` to recompile TypeScript
3. Refresh the taskpane in Word (or reload the add-in)
4. Check browser console in Word's developer tools:
   - Windows: F12 or right-click taskpane > Inspect
   - macOS: Enable in Preferences > Advanced > Developer menu

## Environment Files

The dev manifest (`word.dev.xml`) points to:

- **URL:** `https://cdn.mosaicpolicy.com`
- **ID:** `18a0d0a9-5ed1-4dc5-875c-2a2a0b9021be`

To use test or production environments, sideload the respective manifests:

- `manifest/sideload/word.test.xml` - Test environment
- `manifest/sideload/word.prod.xml` - Production environment

## Additional Resources

- [Office Add-ins documentation](https://learn.microsoft.com/en-us/office/dev/add-ins/)
- [Sideload Office Add-ins for testing](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/test-debug-office-add-ins)
- [Debug Office Add-ins on Mac](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/debug-add-ins-on-ipad-and-mac)
