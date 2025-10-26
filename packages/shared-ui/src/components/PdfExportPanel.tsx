import clsx from 'clsx';
import { useState } from 'react';

import { useI18n } from '../hooks/useI18n';

import { Button } from './Button';
import { Toggle } from './Toggle';

export interface PdfExportPanelProps {
  onExport: (options: {
    convertToPdfA: boolean;
    validateAccessibility: boolean;
  }) => Promise<void> | void;
  className?: string;
}

export function PdfExportPanel({ onExport, className }: PdfExportPanelProps) {
  const { t } = useI18n();
  const [convertToPdfA, setConvertToPdfA] = useState(true);
  const [validateAccessibility, setValidateAccessibility] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport({ convertToPdfA, validateAccessibility });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className={clsx('mhp-pdf-panel', className)}>
      <header>
        <h3>{t('pdf.panel.title', 'Export to PDF')}</h3>
        <p>{t('pdf.panel.subtitle', 'Select options for accessible export')}</p>
      </header>
      <div className="mhp-pdf-panel__options">
        <Toggle
          checked={convertToPdfA}
          onChange={setConvertToPdfA}
          label={t('pdf.panel.pdfa', 'Convert to PDF/A-2b')}
        />
        <Toggle
          checked={validateAccessibility}
          onChange={setValidateAccessibility}
          label={t('pdf.panel.validate', 'Validate accessibility (PDF/UA & PDF/A)')}
        />
      </div>
      <Button variant="primary" onClick={() => void handleExport()} isLoading={isExporting}>
        {isExporting
          ? t('pdf.panel.exporting', 'Exporting...')
          : t('pdf.panel.export', 'Export PDF')}
      </Button>
    </section>
  );
}
