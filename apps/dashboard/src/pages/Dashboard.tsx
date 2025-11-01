import * as React from 'react';

const API_BASE =
  (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL ??
  'https://mhpbrandfunctions38e5971a.azurewebsites.net';

export default function Dashboard() {
  const [health, setHealth] = React.useState<'checking' | 'ok' | 'fail'>('checking');

  React.useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then(() => setHealth('ok'))
      .catch(() => setHealth('fail'));
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: '64px auto', fontFamily: 'system-ui' }}>
      <h1>Mosaic Dashboard</h1>
      <p>Welcome to Mosaic. Quick status:</p>
      <ul>
        <li>
          <strong>Backend:</strong>{' '}
          {health === 'checking' ? 'Checking…' : health === 'ok' ? 'Healthy ✅' : 'Unavailable ❌'}
        </li>
        <li>
          <strong>Functions Host:</strong> {API_BASE}
        </li>
      </ul>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}
      >
        <a href="/templates" style={card}>
          Templates
        </a>
        <a href="/compliance" style={card}>
          Compliance Scan
        </a>
        <a href="/analytics" style={card}>
          Analytics
        </a>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  display: 'block',
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  textDecoration: 'none',
  color: '#111'
};
