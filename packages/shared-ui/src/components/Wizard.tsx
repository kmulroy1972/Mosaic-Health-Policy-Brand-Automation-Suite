import clsx from 'clsx';
import { KeyboardEvent, ReactNode } from 'react';

import { useI18n } from '../hooks/useI18n';

import { Button } from './Button';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}

export interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange?: (index: number) => void;
  onFinish?: () => void;
  className?: string;
}

export function Wizard({ steps, currentStep, onStepChange, onFinish, className }: WizardProps) {
  const { t } = useI18n();
  const activeStep = steps[currentStep];

  const goToStep = (index: number) => {
    if (index < 0 || index >= steps.length) {
      return;
    }
    onStepChange?.(index);
  };

  const handleIndicatorKeyDown = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToStep(index + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToStep(index - 1);
    }
  };

  return (
    <div className={clsx('mhp-wizard', className)}>
      <ol className="mhp-wizard__steps">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          return (
            <li
              key={step.id}
              className="mhp-wizard__step"
              data-active={isActive ? 'true' : undefined}
              aria-current={index === currentStep ? 'step' : undefined}
            >
              <button
                type="button"
                onClick={() => goToStep(index)}
                onKeyDown={handleIndicatorKeyDown(index)}
                aria-label={`${index + 1}. ${step.title}`}
              >
                <span className="sr-only">{step.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div role="group" aria-labelledby={`${activeStep.id}-title`}>
        <h3 id={`${activeStep.id}-title`} style={{ margin: 0 }}>
          {activeStep.title}
        </h3>
        {activeStep.description && <p>{activeStep.description}</p>}
        <div>{activeStep.content}</div>
      </div>

      <div className="mhp-wizard__actions">
        <Button
          variant="ghost"
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          {t('wizard.previous', 'Previous')}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={() => goToStep(currentStep + 1)}>{t('wizard.next', 'Next')}</Button>
        ) : (
          <Button variant="accent" onClick={onFinish}>
            {t('wizard.complete', 'Finish')}
          </Button>
        )}
      </div>
    </div>
  );
}
