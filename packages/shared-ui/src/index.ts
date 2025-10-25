import type { FeatureFlagSnapshot } from '@mhp/shared-brand-core';

export type UiTheme = {
  name: string;
  tokens: Record<string, string>;
};

export interface ComponentContext {
  theme: UiTheme;
  flags: FeatureFlagSnapshot;
}

const baseTheme: UiTheme = {
  name: 'mhp-default',
  tokens: {
    '--mhp-color-primary': '#003057',
    '--mhp-color-accent': '#f6851f'
  }
};

export function createComponentContext(overrides?: Partial<ComponentContext>): ComponentContext {
  return {
    theme: overrides?.theme ?? baseTheme,
    flags: overrides?.flags ?? {
      enablePdfA: true,
      allowNonAzureAI: false
    }
  };
}
