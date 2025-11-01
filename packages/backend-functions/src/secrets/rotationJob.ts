import { Timer, InvocationContext, app } from '@azure/functions';

import { createTraceContextForTimer } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { checkRotationWindows } from './rotation';

/**
 * Weekly secret rotation check job
 * Runs every Monday at 1:00 AM UTC
 */
export async function rotateSecretsJob(myTimer: Timer, context: InvocationContext): Promise<void> {
  const timestamp = new Date().toISOString();
  const logger = createLogger(context);
  const traceContext = createTraceContextForTimer(context);

  logger.info('Secret rotation job started', {
    timestamp,
    correlationId: traceContext.correlationId
  });

  try {
    const rotationWindows = await checkRotationWindows(context);
    const secretsNeedingRotation = rotationWindows.filter((w) => w.needsRotation);

    if (secretsNeedingRotation.length === 0) {
      logger.info('No secrets require rotation', {
        correlationId: traceContext.correlationId
      });
      return;
    }

    logger.info('Secrets requiring rotation', {
      count: secretsNeedingRotation.length,
      secrets: secretsNeedingRotation.map((s) => s.secretName),
      correlationId: traceContext.correlationId
    });

    // TODO: Actually rotate secrets (requires Key Vault integration)
    for (const secret of secretsNeedingRotation) {
      logger.info(`Rotation task logged for: ${secret.secretName}`, {
        secretName: secret.secretName,
        correlationId: traceContext.correlationId
      });
      // await rotateSecret(secret.secretName, context);
    }

    logger.info('Secret rotation job completed', {
      secretsChecked: rotationWindows.length,
      secretsRotated: secretsNeedingRotation.length,
      correlationId: traceContext.correlationId
    });
  } catch (error) {
    logger.error(
      'Secret rotation job failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// Register weekly timer (Monday 1:00 AM UTC)
app.timer('rotateSecretsJob', {
  schedule: '0 0 1 * * 1', // Cron: Monday 1:00 AM
  handler: rotateSecretsJob
});
