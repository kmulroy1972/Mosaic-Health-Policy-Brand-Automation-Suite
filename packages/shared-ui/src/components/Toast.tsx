import clsx from 'clsx';
import { ReactNode } from 'react';

import { useI18n } from '../hooks/useI18n';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  tone?: ToastTone;
  title?: string;
  description?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Toast({ tone = 'info', title, description, onDismiss, className }: ToastProps) {
  const { t } = useI18n();
  const role = tone === 'danger' ? 'alert' : 'status';
  const ariaLive = tone === 'danger' ? 'assertive' : 'polite';

  return (
    <div role={role} aria-live={ariaLive} className={clsx('mhp-toast', className)} data-tone={tone}>
      <div>
        {title && <strong>{title}</strong>}
        {description && <div>{description}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="mhp-btn" data-variant="ghost" onClick={onDismiss}>
          {t('toast.dismiss', 'Dismiss notification')}
        </button>
      )}
    </div>
  );
}
