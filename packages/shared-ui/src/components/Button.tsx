import clsx from 'clsx';
import { forwardRef, ReactNode } from 'react';

import { useI18n } from '../hooks/useI18n';

export type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    leadingIcon,
    trailingIcon,
    isLoading = false,
    className,
    disabled,
    children,
    ...rest
  },
  ref
) {
  const { t } = useI18n();
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      className={clsx('mhp-btn', className)}
      data-variant={variant}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      {...rest}
    >
      {leadingIcon && <span aria-hidden="true">{leadingIcon}</span>}
      <span>{children}</span>
      {isLoading ? (
        <span className="mhp-spinner" role="presentation" aria-hidden="true" />
      ) : (
        trailingIcon && <span aria-hidden="true">{trailingIcon}</span>
      )}
      {isLoading && <span className="sr-only">{t('button.aria.loading', 'Loading')}</span>}
    </button>
  );
});
