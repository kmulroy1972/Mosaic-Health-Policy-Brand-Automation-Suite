import clsx from 'clsx';

export interface ProgressBarProps {
  value?: number;
  min?: number;
  max?: number;
  label?: string;
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  min = 0,
  max = 100,
  label,
  indeterminate = false,
  className
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value ?? 0, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  return (
    <div
      className={clsx('mhp-progress', className)}
      role="progressbar"
      aria-valuemin={indeterminate ? undefined : min}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-label={label}
    >
      <div
        className="mhp-progress__bar"
        style={indeterminate ? undefined : { width: `${percentage}%` }}
        data-indeterminate={indeterminate ? 'true' : undefined}
      />
    </div>
  );
}
