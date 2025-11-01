import * as React from 'react';

import { postJSON } from '../lib/api';

type Finding = {
  id?: string;
  rule: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: string;
};
type Result = { passed: boolean; score?: number; issues: Finding[] };

export default function CompliancePage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function toBase64(f: File) {
    const buf = await f.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function runScan() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const payload = { filename: file.name, fileBase64: await toBase64(file) };
      const data = await postJSON<Result>('/api/pdf/validate', payload);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Accessibility & Compliance Scan</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={runScan} disabled={!file || busy} style={{ marginLeft: 12 }}>
        {busy ? 'Scanning…' : 'Run scan'}
      </button>

      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <p>
            <strong>Passed:</strong> {result.passed ? 'Yes ✅' : 'No ❌'}{' '}
            {result.score != null && `(score ${result.score})`}
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                <th align="left">Rule</th>
                <th align="left">Severity</th>
                <th align="left">Message</th>
                <th align="left">Location</th>
              </tr>
            </thead>
            <tbody>
              {result.issues.map((i, idx) => (
                <tr key={i.id ?? idx} style={{ borderTop: '1px solid #eee' }}>
                  <td>{i.rule}</td>
                  <td>{i.severity}</td>
                  <td>{i.message}</td>
                  <td>{i.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
