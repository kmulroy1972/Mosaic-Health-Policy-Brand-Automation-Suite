import { sanitizeTelemetryAttributes, sanitizeUrl, scrubString } from '../telemetry';

describe('telemetry sanitization', () => {
  it('scrubs emails and ssn in strings', () => {
    const input = 'Contact me at user@example.com or 123-45-6789';
    const result = scrubString(input);
    expect(result).not.toContain('user@example.com');
    expect(result).not.toContain('123-45-6789');
    expect(result).toContain('[REDACTED_EMAIL]');
    expect(result).toContain('[REDACTED_SSN]');
  });

  it('sanitizes url query parameters', () => {
    const result = sanitizeUrl('https://contoso.com/path?code=secret&tenant=abc#hash');
    expect(result).toBe('https://contoso.com/path');
  });

  it('sanitizes nested telemetry attributes', () => {
    const attributes = sanitizeTelemetryAttributes({
      message: 'user@example.com',
      details: {
        ssn: '123-45-6789',
        urls: ['https://contoso.com?a=1']
      },
      values: [
        {
          token: 'abc@def.com'
        }
      ]
    });

    expect(JSON.stringify(attributes)).not.toContain('user@example.com');
    expect(JSON.stringify(attributes)).not.toContain('123-45-6789');
    expect(JSON.stringify(attributes)).toContain('[REDACTED_EMAIL]');
    expect(JSON.stringify(attributes)).toContain('[REDACTED_SSN]');
    expect(JSON.stringify(attributes)).toContain('https://contoso.com');
    expect(JSON.stringify(attributes)).not.toContain('?a=1');
  });
});
