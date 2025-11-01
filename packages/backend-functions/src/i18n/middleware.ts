import type { HttpRequest } from '@azure/functions';

import { createTranslator, type SupportedLanguage } from './translator';

/**
 * Extract language from request (header, query param, or default)
 */
export function getLanguageFromRequest(request: HttpRequest): SupportedLanguage {
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const lang = acceptLanguage.split(',')[0].toLowerCase().split('-')[0];
    if (['en', 'es', 'fr', 'pt'].includes(lang)) {
      return lang as SupportedLanguage;
    }
  }

  // Check query parameter
  const langParam = request.query.get('language') || request.query.get('lang');
  if (langParam && ['en', 'es', 'fr', 'pt'].includes(langParam.toLowerCase())) {
    return langParam.toLowerCase() as SupportedLanguage;
  }

  // Default to English
  return 'en';
}

/**
 * Create translator from request
 */
export function getTranslator(request: HttpRequest) {
  const language = getLanguageFromRequest(request);
  return createTranslator(language);
}
