import { DefaultAzureCredential } from '@azure/identity';
import { GraphClient } from '@mhp/shared-brand-core';

const GRAPH_SCOPE = ['https://graph.microsoft.com/.default'];

let singleton: GraphClient | null = null;
let credential: DefaultAzureCredential | null = null;

function resolveCredential(): DefaultAzureCredential | null {
  if (process.env.GRAPH_ACCESS_TOKEN) {
    return null;
  }
  if (!credential) {
    credential = new DefaultAzureCredential();
  }
  return credential;
}

async function acquireToken(): Promise<string> {
  if (process.env.GRAPH_ACCESS_TOKEN) {
    return process.env.GRAPH_ACCESS_TOKEN;
  }
  const activeCredential = resolveCredential();
  if (!activeCredential) {
    throw new Error('No credential available for Microsoft Graph.');
  }
  const token = await activeCredential.getToken(GRAPH_SCOPE);
  if (!token?.token) {
    throw new Error('Failed to acquire Microsoft Graph token.');
  }
  return token.token;
}

export function getGraphClient(): GraphClient {
  if (!singleton) {
    singleton = new GraphClient({
      getToken: acquireToken,
      userAgent: 'mhp-brand-automation/1.0'
    });
  }
  return singleton;
}
