import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';

import { useFocusTrap } from '../hooks/useFocusTrap';
import { useI18n } from '../hooks/useI18n';
import { readPreference, writePreference } from '../storage/indexedDb';

import { Button } from './Button';

export interface TourStep {
  title: string;
  description: string;
}

export interface FirstRunTourProps {
  steps: TourStep[];
  storageKey?: string;
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_STORAGE_KEY = 'tour_completed';

export function FirstRunTour({
  steps,
  storageKey = DEFAULT_STORAGE_KEY,
  onComplete,
  className
}: FirstRunTourProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const labelId = useId();

  useFocusTrap(dialogRef, isVisible);

  useEffect(() => {
    let active = true;
    (async () => {
      const completed = await readPreference<boolean>(storageKey);
      if (!active) {
        return;
      }
      if (completed) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        void markCompleted();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToStep(currentStep + 1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToStep(currentStep - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, currentStep]);

  if (isLoading || !isVisible) {
    return null;
  }

  const goToStep = (index: number) => {
    if (index < 0 || index >= steps.length) {
      return;
    }
    setCurrentStep(index);
  };

  const markCompleted = async () => {
    setIsVisible(false);
    await writePreference(storageKey, true);
    onComplete?.();
  };

  const activeStep = steps[currentStep];

  return (
    <div className="mhp-tour-backdrop" role="presentation">
      <div
        ref={dialogRef}
        className={clsx('mhp-tour', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
      >
        <header>
          <h2 id={labelId} style={{ margin: 0 }}>
            {t('tour.title', 'Welcome to MHP Brand Automation')}
          </h2>
          <p style={{ margin: 0 }}>{t('tour.intro', "Let's walk through the essentials.")}</p>
        </header>

        <div>
          <strong>
            {currentStep + 1} / {steps.length}: {activeStep.title}
          </strong>
          <p>{activeStep.description}</p>
        </div>

        <footer className="mhp-tour__footer">
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                goToStep(Math.max(0, currentStep - 1));
              }}
              disabled={currentStep === 0}
            >
              {t('wizard.previous', 'Previous')}
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--mhp-spacing-sm)' }}>
            <Button variant="ghost" onClick={markCompleted}>
              {t('tour.skip', 'Skip tour')}
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button variant="accent" onClick={markCompleted}>
                {t('tour.finish', 'Finish tour')}
              </Button>
            ) : (
              <Button onClick={() => goToStep(currentStep + 1)}>
                {t('tour.next', 'Next step')}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
