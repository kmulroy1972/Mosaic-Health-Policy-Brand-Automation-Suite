import fs from 'fs';
import path from 'path';

const MANIFEST_DIR = path.resolve(process.cwd(), 'manifest');
const OUTPUT_DIR = path.resolve(process.cwd(), 'artifacts');

interface ManifestConfig {
  environment: 'dev' | 'test' | 'prod';
  cdnBaseUrl: string;
  functionsBaseUrl: string;
}

const envConfig: Record<string, ManifestConfig> = {
  dev: {
    environment: 'dev',
    cdnBaseUrl: process.env.DEV_CDN_BASE_URL ?? 'https://localhost:3000',
    functionsBaseUrl: process.env.DEV_FUNCTIONS_BASE_URL ?? 'https://localhost:7071'
  },
  test: {
    environment: 'test',
    cdnBaseUrl: process.env.TEST_CDN_BASE_URL ?? 'https://test.cdn.mhp',
    functionsBaseUrl:
      process.env.TEST_FUNCTIONS_BASE_URL ?? 'https://mhp-functions-test.azurewebsites.net'
  },
  prod: {
    environment: 'prod',
    cdnBaseUrl: process.env.PROD_CDN_BASE_URL ?? 'https://cdn.mhp.com',
    functionsBaseUrl:
      process.env.PROD_FUNCTIONS_BASE_URL ?? 'https://mhp-functions.azurewebsites.net'
  }
};

function replacePlaceholders(manifest: string, config: ManifestConfig): string {
  return manifest
    .replace(/__CDN_BASE_URL__/g, config.cdnBaseUrl)
    .replace(/__FUNCTIONS_BASE_URL__/g, config.functionsBaseUrl);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function packageManifest(environment: keyof typeof envConfig): void {
  const manifestPath = path.join(MANIFEST_DIR, `unified.${environment}.json`);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const processed = replacePlaceholders(manifest, envConfig[environment]);
  const outputDir = path.join(OUTPUT_DIR, environment);
  ensureDir(outputDir);
  fs.writeFileSync(path.join(outputDir, `manifest-unified-${environment}.json`), processed);
   
  console.log(`[deploy] Packaged manifest for ${environment}`);
}

function main() {
  const environments = process.argv.slice(2);
  if (environments.length === 0) {
    throw new Error('Usage: ts-node scripts/deployment/package-manifests.ts <dev|test|prod> [...]');
  }
  environments.forEach((env) => packageManifest(env as keyof typeof envConfig));
}

main();
