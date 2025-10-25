import rawTokens from '../design-tokens.json';

export type DesignTokens = typeof rawTokens;

export interface Theme {
  name: string;
  tokens: DesignTokens;
  cssVariables: string;
}

const DEFAULT_SELECTOR = ':root';

function flattenTokens(
  tokens: Record<string, unknown>,
  path: string[] = []
): Array<{ name: string; value: string }> {
  const entries: Array<{ name: string; value: string }> = [];

  for (const [key, value] of Object.entries(tokens)) {
    const nextPath = [...path, key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flattenTokens(value as Record<string, unknown>, nextPath));
    } else {
      const cssName = `--mhp-${nextPath
        .join('-')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()}`;
      entries.push({ name: cssName, value: String(value) });
    }
  }

  return entries;
}

export function createCssVariables(
  tokens: DesignTokens,
  selector: string = DEFAULT_SELECTOR
): string {
  const lines = flattenTokens(tokens).map(({ name, value }) => `  ${name}: ${value};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

export function createTheme(name: string, tokens: DesignTokens): Theme {
  return {
    name,
    tokens,
    cssVariables: `${createCssVariables(tokens)}\n${createCssVariables(tokens, '[data-mhp-theme]')}`
  };
}

export const defaultTokens: DesignTokens = rawTokens;
export const defaultTheme: Theme = createTheme('mhp-default', defaultTokens);
