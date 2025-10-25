import clsx from 'clsx';
import { cloneElement, ReactElement, ReactNode, useId, useMemo, useState } from 'react';
import type { FocusEvent, MouseEvent } from 'react';

export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
  children: ReactElement;
}

export function Tooltip({ content, placement = 'top', className, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  const tooltipStyle = useMemo(() => {
    const base = {
      left: '50%',
      transform: 'translateX(-50%)'
    } as const;

    if (placement === 'top') {
      return {
        ...base,
        bottom: '100%',
        marginBottom: '8px'
      };
    }

    return {
      ...base,
      top: '100%',
      marginTop: '8px'
    };
  }, [placement]);

  const describedBy = [children.props?.['aria-describedby'], visible ? tooltipId : null]
    .filter(Boolean)
    .join(' ');

  const childWithProps = cloneElement(children, {
    onFocus: (event: FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(event);
      setVisible(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(event);
      setVisible(false);
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(event);
      setVisible(true);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(event);
      setVisible(false);
    },
    'aria-describedby': describedBy || undefined
  });

  return (
    <span className="mhp-tooltip__wrapper">
      {childWithProps}
      {visible && (
        <span
          role="tooltip"
          id={tooltipId}
          className={clsx('mhp-tooltip', className)}
          style={tooltipStyle}
        >
          {content}
        </span>
      )}
    </span>
  );
}
