/**
 * A/B Testing & Prompt Evaluation
 */

export interface ExperimentConfig {
  variantA: {
    prompt: string;
    weight: number; // Percentage of traffic
  };
  variantB: {
    prompt: string;
    weight: number;
  };
  metrics: {
    jsonValidity: number;
    latency: number;
    userAcceptRate: number;
  };
}

export interface ExperimentResult {
  variant: 'A' | 'B';
  metrics: {
    jsonValidity: number;
    averageLatency: number;
    userAcceptRate: number;
    totalRequests: number;
  };
}

const experiments: Map<string, ExperimentConfig> = new Map();

export function createExperiment(name: string, config: ExperimentConfig): void {
  experiments.set(name, config);
}

export function selectVariant(experimentName: string): 'A' | 'B' {
  const experiment = experiments.get(experimentName);
  if (!experiment) {
    return 'A'; // Default
  }

  const random = Math.random() * 100;
  return random < experiment.variantA.weight ? 'A' : 'B';
}

export function recordMetric(
  experimentName: string,
  _variant: 'A' | 'B',
  _metric: 'jsonValidity' | 'latency' | 'userAccept'
): void {
  // TODO: Store metrics in Cosmos DB
  const experiment = experiments.get(experimentName);
  if (experiment) {
    // Update metrics
  }
}
