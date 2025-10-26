import {
  submitRewriteRequest,
  rewriteGoalOptions,
  rewriteToneOptions,
  type RewriteGoal,
  type RewriteRequestInput,
  type RewriteResponse,
  type RewriteTone
} from '@mhp/shared-brand-core';
import clsx from 'clsx';
import { FormEvent, useId, useMemo, useState } from 'react';


import { useI18n } from '../hooks/useI18n';

import { Button } from './Button';
import { Toggle } from './Toggle';
import { Tooltip } from './Tooltip';

export interface BrandSafeRewritePanelProps {
  initialText: string;
  brandTerms?: string[];
  onApply?: (text: string) => Promise<void> | void;
  onRewriteComplete?: (
    response: RewriteResponse,
    meta: { elapsedMs: number; request: RewriteRequestInput }
  ) => void;
  submitRewrite?: (payload: RewriteRequestInput) => Promise<RewriteResponse>;
  className?: string;
}

type GoalState = Record<RewriteGoal, boolean>;
type ToneState = Record<RewriteTone, boolean>;

const DEFAULT_GOAL_STATE: GoalState = {
  concise: true,
  formal: false,
  'lay-audience': false
};

const DEFAULT_TONE_STATE: ToneState = {
  neutral: false,
  professional: true
};

export function BrandSafeRewritePanel({
  initialText,
  brandTerms,
  onApply,
  onRewriteComplete,
  submitRewrite,
  className
}: BrandSafeRewritePanelProps) {
  const { t } = useI18n();
  const textInputId = useId();
  const resultId = useId();
  const [sourceText, setSourceText] = useState(initialText);
  const [goalState, setGoalState] = useState<GoalState>(DEFAULT_GOAL_STATE);
  const [toneState, setToneState] = useState<ToneState>(DEFAULT_TONE_STATE);
  const [piiMode, setPiiMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedGoals = useMemo(
    () => rewriteGoalOptions.filter((option) => goalState[option]),
    [goalState]
  );

  const selectedTones = useMemo(
    () => rewriteToneOptions.filter((option) => toneState[option]),
    [toneState]
  );

  const routeDescription = piiMode
    ? t('ai.rewrite.route.azure', 'Routing via Azure OpenAI (PII-safe within tenant)')
    : t('ai.rewrite.route.standard', 'Routing via standard non-sensitive channel');

  const toggleGoal = (goal: RewriteGoal) => {
    setGoalState((previous) => ({ ...previous, [goal]: !previous[goal] }));
  };

  const toggleTone = (tone: RewriteTone) => {
    setToneState((previous) => ({ ...previous, [tone]: !previous[tone] }));
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const startedAt = Date.now();
    try {
      const payload: RewriteRequestInput = {
        text: sourceText,
        goal: selectedGoals,
        tone: selectedTones,
        brandTerms,
        piiMode
      };
      const response = await (submitRewrite ?? submitRewriteRequest)(payload);
      setResult(response);
      onRewriteComplete?.(response, {
        elapsedMs: Date.now() - startedAt,
        request: payload
      });
    } catch (rewriteError) {
      setResult(null);
      setError(
        rewriteError instanceof Error
          ? rewriteError.message
          : t('ai.rewrite.error.generic', 'Rewrite failed. Try again later.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async () => {
    if (!result?.text || !onApply) {
      return;
    }
    await onApply(result.text);
  };

  return (
    <form className={clsx('mhp-rewrite-panel', className)} onSubmit={handleSubmit}>
      <header>
        <h3>{t('ai.rewrite.title', 'Brand-safe Rewrite')}</h3>
        <p>{t('ai.rewrite.subtitle', 'Adjust goal, tone, and PHI handling before rewriting.')}</p>
      </header>

      <label className="mhp-rewrite-panel__field" htmlFor={textInputId}>
        <span>{t('ai.rewrite.input.label', 'Original text')}</span>
        <textarea
          id={textInputId}
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          rows={6}
        />
      </label>

      <fieldset
        className="mhp-rewrite-panel__options"
        aria-label={t('ai.rewrite.goals', 'Rewrite goals')}
      >
        <legend>{t('ai.rewrite.goals', 'Rewrite goals')}</legend>
        {rewriteGoalOptions.map((goal) => {
          const goalId = `${textInputId}-${goal}`;
          return (
            <label key={goal} htmlFor={goalId} className="mhp-rewrite-panel__checkbox">
              <input
                id={goalId}
                type="checkbox"
                checked={goalState[goal]}
                onChange={() => toggleGoal(goal)}
              />
              <span>
                {goal === 'concise' && t('ai.rewrite.goal.concise', 'Make it concise')}
                {goal === 'formal' && t('ai.rewrite.goal.formal', 'Increase formality')}
                {goal === 'lay-audience' && t('ai.rewrite.goal.lay', 'Clarify for lay audience')}
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="mhp-rewrite-panel__options" aria-label={t('ai.rewrite.tones', 'Tone')}>
        <legend>{t('ai.rewrite.tones', 'Tone')}</legend>
        {rewriteToneOptions.map((tone) => {
          const toneId = `${textInputId}-${tone}`;
          return (
            <label key={tone} htmlFor={toneId} className="mhp-rewrite-panel__checkbox">
              <input
                id={toneId}
                type="checkbox"
                checked={toneState[tone]}
                onChange={() => toggleTone(tone)}
              />
              <span>
                {tone === 'neutral' && t('ai.rewrite.tone.neutral', 'Neutral tone')}
                {tone === 'professional' && t('ai.rewrite.tone.professional', 'Professional tone')}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="mhp-rewrite-panel__route">
        <Tooltip
          content={t(
            'ai.rewrite.pii.tooltip',
            'Keep enabled for PHI/PII so requests stay within Azure OpenAI.'
          )}
        >
          <Toggle
            checked={piiMode}
            onChange={setPiiMode}
            label={t('ai.rewrite.pii.label', 'This text includes PHI/PII')}
          />
        </Tooltip>
        <span className="mhp-rewrite-panel__route-label">{routeDescription}</span>
      </div>

      {error && (
        <p role="alert" className="mhp-rewrite-panel__error">
          {error}
        </p>
      )}

      <div className="mhp-rewrite-panel__actions">
        <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={!sourceText}>
          {isSubmitting
            ? t('ai.rewrite.action.processing', 'Rewriting...')
            : t('ai.rewrite.action.submit', 'Rewrite selection')}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => void handleApply()}
          disabled={!result?.text || !onApply}
        >
          {t('ai.rewrite.action.apply', 'Insert rewrite')}
        </Button>
      </div>

      {result?.text && (
        <section className="mhp-rewrite-panel__result" aria-labelledby={resultId}>
          <h4 id={resultId}>{t('ai.rewrite.result.label', 'Rewritten text')}</h4>
          <textarea value={result.text} readOnly rows={6} />
        </section>
      )}
    </form>
  );
}
