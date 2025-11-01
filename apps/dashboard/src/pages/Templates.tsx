import * as React from 'react';

import { getJSON } from '../lib/api';

type Template = { id: string; name: string; category?: string; updatedAt?: string };

export default function TemplatesPage() {
  const [data, setData] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setData(await getJSON<Template[]>('/api/templates'));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading templates…</div>;
  if (error) return <div style={{ padding: 24, color: '#b91c1c' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Templates</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Category</th>
            <th align="left">Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{t.name}</td>
              <td>{t.category || '—'}</td>
              <td>{t.updatedAt || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
