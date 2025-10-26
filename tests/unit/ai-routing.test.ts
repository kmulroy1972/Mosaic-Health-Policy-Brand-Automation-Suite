import { validateRewriteRequest, isAzureOpenAIEndpoint } from '@mhp/shared-brand-core';

describe('AI rewrite validation', () => {
  it('enforces text requirement', () => {
    const result = validateRewriteRequest({ text: '   ' });
    expect(result.ok).toBe(false);
  });

  it('normalises goal/tone and trims brand terms', () => {
    const result = validateRewriteRequest({
      text: 'Draft content',
      goal: ['concise', 'invalid' as unknown as 'concise', 'concise'],
      tone: ['professional', 'neutral', 'other' as unknown as 'professional'],
      brandTerms: ['  Azure  ', 'MHP', '', 'MHP']
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.goal).toEqual(['concise']);
      expect(result.value.tone).toEqual(['professional', 'neutral']);
      expect(result.value.brandTerms).toEqual(['Azure', 'MHP']);
    }
  });

  it('detects Azure OpenAI endpoints only', () => {
    expect(isAzureOpenAIEndpoint('https://contoso.openai.azure.com')).toBe(true);
    expect(isAzureOpenAIEndpoint('https://api.openai.com')).toBe(false);
    expect(isAzureOpenAIEndpoint('')).toBe(false);
  });
});
