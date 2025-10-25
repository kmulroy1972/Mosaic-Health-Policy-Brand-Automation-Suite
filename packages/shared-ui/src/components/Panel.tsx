import clsx from 'clsx';
import { HTMLAttributes, useId } from 'react';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Panel({ title, className, id, children, ...rest }: PanelProps) {
  const generatedId = useId();
  const headingId = title ? `${generatedId}-heading` : undefined;

  return (
    <div
      id={id}
      className={clsx('mhp-panel', className)}
      role={title ? 'region' : undefined}
      aria-labelledby={title ? headingId : undefined}
      {...rest}
    >
      {title && (
        <h2 id={headingId} style={{ margin: 0, fontSize: 'var(--mhp-typography-font-size-lg)' }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
