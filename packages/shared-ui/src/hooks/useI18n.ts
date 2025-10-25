import { useI18n as useI18nContext } from '../context/I18nContext';

export function useI18n() {
  return useI18nContext();
}
