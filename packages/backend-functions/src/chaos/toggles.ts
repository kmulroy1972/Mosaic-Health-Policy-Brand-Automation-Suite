/**
 * Chaos engineering toggles
 */

export interface ChaosConfig {
  failAI: boolean; // Fail AI calls with error
  slowGraph: boolean; // Add delay to Graph API calls
  throttleStorage: boolean; // Throttle storage operations
}

const chaosConfig: ChaosConfig = {
  failAI: process.env.CHAOS_FAIL_AI === 'true',
  slowGraph: process.env.CHAOS_SLOW_GRAPH === 'true',
  throttleStorage: process.env.CHAOS_THROTTLE_STORAGE === 'true'
};

export function getChaosConfig(): ChaosConfig {
  return chaosConfig;
}

export async function applyChaosIfEnabled<T>(
  operation: 'ai' | 'graph' | 'storage',
  fn: () => Promise<T>
): Promise<T> {
  const config = getChaosConfig();

  if (operation === 'ai' && config.failAI) {
    throw new Error('Chaos: AI operation failed');
  }

  if (operation === 'graph' && config.slowGraph) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
  }

  if (operation === 'storage' && config.throttleStorage) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
  }

  return fn();
}
