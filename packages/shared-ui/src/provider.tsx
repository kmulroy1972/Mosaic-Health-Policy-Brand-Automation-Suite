import { Fragment, ReactNode, useMemo } from 'react';

import { I18nContext } from './context/I18nContext';
import { MotionContext } from './context/MotionContext';
import { ThemeContext } from './context/ThemeContext';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { enMessages } from './i18n/en';
import type { MessagesByLocale } from './i18n/types';
import { baseComponentStyles } from './styles/baseStyles';
import { DesignTokens, Theme, createTheme, defaultTheme, defaultTokens } from './tokens';

export interface SharedUiProviderProps {
  children: ReactNode;
  locale?: string;
  messages?: MessagesByLocale;
  tokens?: Partial<DesignTokens>;
  reduceMotion?: boolean;
  className?: string;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge<T extends Record<string, unknown>>(base: T, overrides?: DeepPartial<T>): T {
  if (!overrides) {
    return base;
  }

  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      continue;
    }

    const baseValue = result[key];
    if (isRecord(baseValue) && isRecord(value)) {
      result[key] = deepMerge(baseValue, value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

function resolveTheme(tokens?: DeepPartial<DesignTokens>): Theme {
  if (!tokens) {
    return defaultTheme;
  }
  const merged = deepMerge(defaultTokens, tokens);
  return createTheme('mhp-custom', merged);
}

export function SharedUiProvider({
  children,
  locale = 'en',
  messages,
  tokens,
  reduceMotion,
  className
}: SharedUiProviderProps) {
  const detectedMotionPreference = usePrefersReducedMotion(reduceMotion ?? false);
  const prefersReducedMotion = reduceMotion ?? detectedMotionPreference;

  const theme = useMemo(() => resolveTheme(tokens), [tokens]);

  const allMessages = useMemo<MessagesByLocale>(() => {
    return {
      en: enMessages,
      ...messages
    };
  }, [messages]);

  const i18n = useMemo(
    () => ({
      locale,
      messages: allMessages,
      t: (key: string, fallback?: string) =>
        allMessages[locale]?.[key] ?? allMessages.en?.[key] ?? fallback ?? key
    }),
    [allMessages, locale]
  );

  const styleSheet = useMemo(() => `${theme.cssVariables}\n${baseComponentStyles}`, [theme]);

  return (
    <I18nContext.Provider value={i18n}>
      <MotionContext.Provider value={{ prefersReducedMotion }}>
        <ThemeContext.Provider value={theme}>
          <Fragment>
            <style data-mhp-shared-ui="" dangerouslySetInnerHTML={{ __html: styleSheet }} />
            <div data-mhp-theme="true" className={className}>
              {children}
            </div>
          </Fragment>
        </ThemeContext.Provider>
      </MotionContext.Provider>
    </I18nContext.Provider>
  );
}
