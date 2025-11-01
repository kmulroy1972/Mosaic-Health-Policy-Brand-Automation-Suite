# Internationalization & Localization Specification

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 17 Complete

## Supported Languages

- **en** - English (default)
- **es** - Spanish (Español)
- **fr** - French (Français)
- **pt** - Portuguese (Português)

## Language Detection

The system detects language from:

1. `Accept-Language` HTTP header
2. `language` or `lang` query parameter
3. Defaults to `en` (English)

## Translation System

**Location:** `packages/backend-functions/src/i18n/translator.ts`

### Usage

```typescript
import { getTranslator } from '../i18n/middleware';

export async function myHttpTrigger(request: HttpRequest, context: InvocationContext) {
  const translator = getTranslator(request);
  const message = translator.translate('brand_guidance_success');
  // Returns localized message based on request language
}
```

## BrandGuidanceAgent Integration

BrandGuidanceAgent accepts `language` parameter:

```json
{
  "documentText": "...",
  "formatRules": "...",
  "language": "es"
}
```

## API Endpoint

**GET** `/api/i18n/detect`

Detects and returns language from request:

```json
{
  "language": "es",
  "detected": true,
  "sampleTranslation": "Análisis de orientación de marca completado con éxito"
}
```

## Adding Translations

Add new translation keys to `translator.ts`:

```typescript
const translations: Translations = {
  my_new_key: {
    en: 'English text',
    es: 'Texto en español',
    fr: 'Texte en français',
    pt: 'Texto em português'
  }
};
```
