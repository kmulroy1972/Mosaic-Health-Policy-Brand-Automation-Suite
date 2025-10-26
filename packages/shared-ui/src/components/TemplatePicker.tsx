import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '../hooks/useI18n';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { readPreference, writePreference } from '../storage/indexedDb';

export interface TemplateSummary {
  id: string;
  name: string;
  type: 'dotx' | 'potx';
  thumbnailUrl: string;
}

export interface TemplatePickerProps {
  templates: TemplateSummary[];
  onApply: (template: TemplateSummary) => Promise<void> | void;
  onPreview?: (template: TemplateSummary) => void;
  className?: string;
}

const LAST_TEMPLATE_KEY = 'last_used_template';

export function TemplatePicker({ templates, onApply, onPreview, className }: TemplatePickerProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [lastTemplateId, setLastTemplateId] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const value = (await readPreference<string>(LAST_TEMPLATE_KEY)) ?? null;
      if (mounted) {
        setLastTemplateId(value);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    const list = templates ?? [];
    if (!search.trim()) {
      return list;
    }
    const term = search.toLowerCase();
    return list.filter((template) => template.name.toLowerCase().includes(term));
  }, [search, templates]);

  const handleApply = async (template: TemplateSummary) => {
    try {
      setApplyingId(template.id);
      await onApply(template);
      writePreference(LAST_TEMPLATE_KEY, template.id).catch(() => {
        /* best effort */
      });
      setLastTemplateId(template.id);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className={clsx('mhp-template-picker', className)}>
      <label className="mhp-template-picker__search">
        <span>{t('templates.search.label', 'Search templates')}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('templates.search.placeholder', 'Type to filter templates')}
        />
      </label>
      <ul className="mhp-template-picker__list">
        {filteredTemplates.map((template) => {
          const isApplying = applyingId === template.id;
          const isLastUsed = lastTemplateId === template.id;
          return (
            <li
              key={template.id}
              className="mhp-template-picker__item"
              data-active={isLastUsed ? 'true' : undefined}
            >
              <button
                type="button"
                className="mhp-template-picker__thumbnail"
                onClick={() => onPreview?.(template)}
                aria-label={t('templates.preview', 'Preview template')}
              >
                <img src={template.thumbnailUrl} alt="" aria-hidden="true" />
              </button>
              <div className="mhp-template-picker__meta">
                <h4>{template.name}</h4>
                <p>{template.type.toUpperCase()}</p>
              </div>
              <button
                type="button"
                className="mhp-btn"
                data-variant={isLastUsed ? 'accent' : 'primary'}
                onClick={() => void handleApply(template)}
                aria-busy={isApplying || undefined}
                disabled={isApplying}
              >
                {isApplying
                  ? t('templates.applying', 'Applying...')
                  : t('templates.apply', 'Apply')}
              </button>
            </li>
          );
        })}
        {filteredTemplates.length === 0 && (
          <li className="mhp-template-picker__empty">
            {t('templates.empty', 'No templates match your search.')}
          </li>
        )}
      </ul>
      {!prefersReducedMotion && (
        <style>
          {`
            .mhp-template-picker__item[data-active='true'] {
              box-shadow: var(--mhp-elevation-md);
              border: 1px solid var(--mhp-colors-primary);
            }
          `}
        </style>
      )}
    </div>
  );
}
