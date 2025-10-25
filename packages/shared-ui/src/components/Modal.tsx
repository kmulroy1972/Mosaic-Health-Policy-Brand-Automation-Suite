import clsx from 'clsx';
import { ReactNode, useEffect, useId, useRef } from 'react';

import { useFocusTrap } from '../hooks/useFocusTrap';
import { useI18n } from '../hooks/useI18n';

export interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  labelledById?: string;
  describedById?: string;
}

export function Modal({
  open,
  title,
  children,
  onClose,
  className,
  labelledById,
  describedById
}: ModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const generatedId = useId();
  const headerId = labelledById ?? `${generatedId}-title`;

  useFocusTrap(modalRef, open);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="mhp-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={modalRef}
        className={clsx('mhp-modal', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headerId}
        aria-describedby={describedById}
        data-mhp-theme="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id={headerId} style={{ margin: 0 }}>
            {title}
          </h2>
          <button type="button" className="mhp-btn" data-variant="ghost" onClick={onClose}>
            {t('modal.close', 'Close dialog')}
          </button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
