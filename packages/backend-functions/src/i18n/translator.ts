/**
 * Internationalization and localization support
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'pt';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
    fr: string;
    pt: string;
  };
}

const translations: Translations = {
  brand_guidance_success: {
    en: 'Brand guidance analysis completed successfully',
    es: 'Análisis de orientación de marca completado con éxito',
    fr: "Analyse d'orientation de marque terminée avec succès",
    pt: 'Análise de orientação de marca concluída com sucesso'
  },
  brand_guidance_error: {
    en: 'Brand guidance analysis failed',
    es: 'El análisis de orientación de marca falló',
    fr: "L'analyse d'orientation de marque a échoué",
    pt: 'Análise de orientação de marca falhou'
  },
  pdf_validation_complete: {
    en: 'PDF validation completed',
    es: 'Validación de PDF completada',
    fr: 'Validation PDF terminée',
    pt: 'Validação de PDF concluída'
  },
  compliance_scan_complete: {
    en: 'Compliance scan completed',
    es: 'Escaneo de cumplimiento completado',
    fr: 'Scan de conformité terminé',
    pt: 'Varredura de conformidade concluída'
  }
};

export class Translator {
  private language: SupportedLanguage;

  constructor(language: SupportedLanguage = 'en') {
    this.language = language;
  }

  translate(key: string, fallback?: string): string {
    const translation = translations[key];
    if (translation) {
      return translation[this.language] || translation.en || fallback || key;
    }
    return fallback || key;
  }

  setLanguage(language: SupportedLanguage): void {
    this.language = language;
  }

  getLanguage(): SupportedLanguage {
    return this.language;
  }
}

export function createTranslator(language: SupportedLanguage = 'en'): Translator {
  return new Translator(language);
}
