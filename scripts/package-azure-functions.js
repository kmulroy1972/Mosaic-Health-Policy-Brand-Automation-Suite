#!/usr/bin/env node
/**
 * Package Azure Functions for deployment
 * Creates a ZIP file with correct structure for Azure Functions v4
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGE_DIR = path.join(__dirname, '../packages/backend-functions');
const DIST_DIR = path.join(PACKAGE_DIR, 'dist');
const OUTPUT_ZIP = path.join(PACKAGE_DIR, 'backend-functions.zip');

console.log('📦 Packaging Azure Functions...\n');

// Step 1: Verify dist exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist/ directory not found. Run pnpm build first.');
  process.exit(1);
}

// Step 2: Copy host.json to dist
console.log('1. Copying host.json to dist/...');
const hostJson = path.join(PACKAGE_DIR, 'host.json');
if (fs.existsSync(hostJson)) {
  fs.copyFileSync(hostJson, path.join(DIST_DIR, 'host.json'));
  console.log('   ✅ host.json copied');
} else {
  console.error('   ❌ host.json not found');
  process.exit(1);
}

// Step 3: Copy package.json to dist (resolve workspace dependencies)
console.log('2. Copying package.json to dist/...');
const packageJson = require(path.join(PACKAGE_DIR, 'package.json'));

// Resolve workspace dependencies
const resolvedDeps = { ...packageJson.dependencies };
if (resolvedDeps['@mhp/shared-brand-core'] === 'workspace:*') {
  delete resolvedDeps['@mhp/shared-brand-core'];
  console.log('   ℹ️  Removing workspace dependency @mhp/shared-brand-core (will bundle)');
}

const prodPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  main: 'app.js',
  dependencies: resolvedDeps
};
fs.writeFileSync(path.join(DIST_DIR, 'package.json'), JSON.stringify(prodPackageJson, null, 2));
console.log('   ✅ package.json created');

// Step 4: Install production dependencies in dist
console.log('3. Installing production dependencies...');
try {
  execSync('npm install --production --omit=dev', {
    cwd: DIST_DIR,
    stdio: 'inherit'
  });
  console.log('   ✅ Dependencies installed');
} catch {
  console.error('   ⚠️  Warning: Dependency installation had issues, continuing...');
}

// Step 5: Create ZIP
console.log('4. Creating deployment package...');
try {
  // Remove old ZIP if exists
  if (fs.existsSync(OUTPUT_ZIP)) {
    fs.unlinkSync(OUTPUT_ZIP);
  }

  // Create ZIP from dist directory
  execSync(`cd "${DIST_DIR}" && zip -r "${OUTPUT_ZIP}" . -x "*.test.*" -x "__tests__/*"`, {
    stdio: 'inherit'
  });

  const stats = fs.statSync(OUTPUT_ZIP);
  console.log(
    `   ✅ Created ${path.basename(OUTPUT_ZIP)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`
  );
} catch (error) {
  console.error('   ❌ Failed to create ZIP');
  console.error(error.message);
  process.exit(1);
}

console.log('\n✅ Azure Functions package ready!');
console.log(`\n📍 Package location: ${OUTPUT_ZIP}`);
console.log('\n📋 Next steps:');
console.log('   1. Upload to Azure:');
console.log('      az webapp deployment source config-zip \\');
console.log('        --src backend-functions.zip \\');
console.log('        --name mhpbrandfunctions38e5971a \\');
console.log('        --resource-group mhp-brand-rg');
console.log('\n   2. Test endpoint:');
console.log('      curl https://api.mosaicpolicy.com/api/health');
