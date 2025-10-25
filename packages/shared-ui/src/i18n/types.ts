export type MessageDictionary = Record<string, string>;

export type MessagesByLocale = Record<string, MessageDictionary>;

export interface I18nContextValue {
  locale: string;
  messages: MessagesByLocale;
  t: (key: string, defaultText?: string) => string;
}
