/**
 * AI prompt history and tuning tracking
 */

export interface PromptVersion {
  version: string;
  prompt: string;
  createdAt: string;
  performance?: {
    averageLatency: number;
    successRate: number;
    userAcceptRate: number;
  };
}

export interface PromptHistory {
  promptName: string;
  versions: PromptVersion[];
  currentVersion: string;
}

const promptHistory: Map<string, PromptHistory> = new Map();

export function recordPromptVersion(promptName: string, version: string, prompt: string): void {
  if (!promptHistory.has(promptName)) {
    promptHistory.set(promptName, {
      promptName,
      versions: [],
      currentVersion: version
    });
  }

  const history = promptHistory.get(promptName)!;
  history.versions.push({
    version,
    prompt,
    createdAt: new Date().toISOString()
  });
  history.currentVersion = version;
}

export function getPromptHistory(promptName: string): PromptHistory | null {
  return promptHistory.get(promptName) || null;
}
