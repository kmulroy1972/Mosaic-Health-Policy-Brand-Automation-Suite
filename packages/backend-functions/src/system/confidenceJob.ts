import { Timer, InvocationContext, app } from '@azure/functions';

import { createTraceContextForTimer } from '../telemetry/tracing';
import { createLogger } from '../utils/logger';

import { generateConfidenceReport } from './confidenceRun';

/**
 * Nightly confidence run job
 * Runs every day at 11:00 PM UTC
 */
export async function nightlyConfidenceJob(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  const timestamp = new Date().toISOString();
  const logger = createLogger(context);
  const traceContext = createTraceContextForTimer(context);

  logger.info('Nightly confidence run started', {
    timestamp,
    correlationId: traceContext.correlationId
  });

  try {
    await generateConfidenceReport(context);

    // TODO: Write report to docs/CONFIDENCE_REPORT_[date].md
    // TODO: Open GitHub issue if failures detected

    logger.info('Nightly confidence run completed', {
      timestamp,
      correlationId: traceContext.correlationId
    });
  } catch (error) {
    logger.error(
      'Confidence run failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// Register nightly timer (11:00 PM UTC)
app.timer('nightlyConfidenceJob', {
  schedule: '0 0 23 * * *', // Cron: Daily at 11:00 PM
  handler: nightlyConfidenceJob
});
