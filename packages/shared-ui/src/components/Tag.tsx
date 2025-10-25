import clsx from 'clsx';
import { ReactNode } from 'react';

import { useI18n } from '../hooks/useI18n';

export type TagTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface TagProps {
  tone?: TagTone;
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

export function Tag({ tone = 'neutral', children, onRemove, removeLabel, className }: TagProps) {
  const { t } = useI18n();
  const label = removeLabel ?? t('tag.remove', 'Remove');

  return (
    <span className={clsx('mhp-tag', className)} data-tone={tone === 'neutral' ? undefined : tone}>
      <span>{children}</span>
      {onRemove && (
        <button type="button" className="mhp-tag__close" onClick={onRemove} aria-label={label}>
          <span aria-hidden="true">×</span>
        </button>
      )}
    </span>
  );
}
