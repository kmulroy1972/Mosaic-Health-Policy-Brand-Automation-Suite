import clsx from 'clsx';
import { KeyboardEvent } from 'react';

import { useI18n } from '../hooks/useI18n';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, id, label, disabled, className }: ToggleProps) {
  const { t } = useI18n();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label className={clsx('mhp-toggle', className)} htmlFor={id}>
      <div
        className="mhp-toggle__control"
        data-checked={checked ? 'true' : undefined}
        aria-hidden="true"
      >
        <span className="mhp-toggle__thumb" data-checked={checked ? 'true' : undefined} />
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? (checked ? t('toggle.on', 'On') : t('toggle.off', 'Off'))}
        className="sr-only"
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
