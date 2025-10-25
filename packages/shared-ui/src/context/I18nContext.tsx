import { createContext, useContext } from 'react';

import { enMessages } from '../i18n/en';
import type { I18nContextValue, MessagesByLocale } from '../i18n/types';

const defaultMessages: MessagesByLocale = {
  en: enMessages
};

const defaultValue: I18nContextValue = {
  locale: 'en',
  messages: defaultMessages,
  t: (key: string, defaultText?: string) => defaultMessages.en[key] ?? defaultText ?? key
};

export const I18nContext = createContext<I18nContextValue>(defaultValue);

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
