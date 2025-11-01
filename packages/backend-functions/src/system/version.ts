/**
 * Version and build metadata
 */

export interface VersionInfo {
  version: string;
  buildDate: string;
  commitSha: string;
  branch: string;
  deploymentTimestamp?: string;
}

export function getVersionInfo(): VersionInfo {
  return {
    version: process.env.APP_VERSION || '0.1.0',
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    commitSha: process.env.COMMIT_SHA || 'unknown',
    branch: process.env.BRANCH || 'main',
    deploymentTimestamp: process.env.DEPLOYMENT_TIMESTAMP
  };
}
