
import type { RewriteRequestInput, RewriteResponse } from '@mhp/shared-brand-core';
import { BrandSafeRewritePanel } from '@mhp/shared-ui';
import { useEffect, useState } from 'react';

import { useBrandContext } from '../context';
import { logError, logRewriteTelemetry } from '../utils/logging';
import { applyRewriteToSelection } from '../utils/rewrite';

export function BrandSafeRewritePane() {
  const brandContext = useBrandContext();
  const [initialText, setInitialText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSelection() {
      if (typeof Word === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        await Word.run(async (context) => {
          const selection = context.document.getSelection();
          selection.load('text');
          await context.sync();
          if (!cancelled) {
            setInitialText(selection.text ?? '');
          }
        });
      } catch (selectionError) {
        if (!cancelled) {
          setError('Unable to read the current selection.');
        }
        logError('ai_rewrite_selection_read_failed', selectionError);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSelection();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRewriteComplete = (
    response: RewriteResponse,
    meta: { elapsedMs: number; request: RewriteRequestInput }
  ) => {
    logRewriteTelemetry({
      result: 'success',
      elapsedMs: meta.elapsedMs,
      piiMode: Boolean(meta.request.piiMode),
      provider: meta.request.piiMode ? 'azure' : 'other',
      modelId: response.modelId,
      promptTokens: response.tokenUsage?.promptTokens,
      completionTokens: response.tokenUsage?.completionTokens
    });
  };

  const handleApply = async (text: string) => {
    try {
      await applyRewriteToSelection(text);
    } catch (applyError) {
      logError('ai_rewrite_apply_failed', applyError);
    }
  };

  if (loading) {
    return <p data-status="loading">Loading selection...</p>;
  }

  if (error) {
    return (
      <p role="alert" data-status="error">
        {error}
      </p>
    );
  }

  return (
    <BrandSafeRewritePanel
      initialText={initialText || ''}
      brandTerms={[brandContext.styles.name]}
      onRewriteComplete={handleRewriteComplete}
      onApply={handleApply}
    />
  );
}
