/**
 * Executive Gamma Deck Generator
 */

import type { InvocationContext } from '@azure/functions';

import { exportToGamma, type GammaExportRequest } from '../gamma/client';

export interface ExecutiveDeckRequest {
  reportId: string;
  metrics: {
    adoption?: number;
    impact?: number;
    compliance?: number;
    revenue?: number;
  };
  format?: 'gamma' | 'powerpoint';
}

export interface ExecutiveDeckResponse {
  deckId: string;
  deckUrl: string;
  format: string;
  generatedAt: string;
}

export async function generateExecutiveDeck(
  request: ExecutiveDeckRequest,
  context: InvocationContext
): Promise<ExecutiveDeckResponse> {
  // TODO: Generate Gamma or PowerPoint executive deck summarizing metrics
  // Aggregate metrics and format for executive presentation

  context.log('Generating executive deck', {
    reportId: request.reportId,
    format: request.format || 'gamma'
  });

  // Build deck content from metrics
  const deckContent = `
# Executive Summary - Q1 2025

## Key Metrics
- Adoption Rate: ${request.metrics.adoption || 0}%
- Impact Score: ${request.metrics.impact || 0}/10
- Compliance Score: ${request.metrics.compliance || 0}%
- Revenue: $${request.metrics.revenue || 0}

## Highlights
- All systems operational
- Client satisfaction high
- Compliance targets met
`;

  if (request.format === 'powerpoint') {
    // TODO: Generate PowerPoint format
    return {
      deckId: `ppt-${Date.now()}`,
      deckUrl: `https://storage.blob.core.windows.net/decks/${request.reportId}.pptx`,
      format: 'powerpoint',
      generatedAt: new Date().toISOString()
    };
  }

  // Generate Gamma deck
  const gammaRequest: GammaExportRequest = {
    content: deckContent,
    title: `Executive Summary - ${request.reportId}`
  };

  const gammaResponse = await exportToGamma(gammaRequest);

  return {
    deckId: gammaResponse.deckId,
    deckUrl: gammaResponse.publicUrl,
    format: 'gamma',
    generatedAt: gammaResponse.createdAt
  };
}
