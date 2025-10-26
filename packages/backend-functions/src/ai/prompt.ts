export function buildSystemPrompt(brandTerms: string[] = []): string {
  const termSentence = brandTerms.length
    ? `Ensure references to ${brandTerms.join(', ')} remain accurate.`
    : '';
  return `You are an assistant constrained to MHP brand tone.
Do not invent facts.
Do not alter provided brand assets.
Use inclusive, professional language.
${termSentence}`.trim();
}
