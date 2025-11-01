import * as React from 'react';

import { getJSON } from '../lib/api';

type Report = {
  date: string;
  docsProduced: number;
  compliancePassRate: number;
  grantMatches: number;
};

export default function AnalyticsPage() {
  const [r, setR] = React.useState<Report | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setR(await getJSON<Report>('/api/analytics/report'));
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  if (error) return <div style={{ padding: 24, color: '#b91c1c' }}>Error: {error}</div>;
  if (!r) return <div style={{ padding: 24 }}>Loading report…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Analytics</h2>
      <ul>
        <li>
          <strong>Date:</strong> {r.date}
        </li>
        <li>
          <strong>Documents produced:</strong> {r.docsProduced}
        </li>
        <li>
          <strong>Compliance pass rate:</strong> {Math.round(r.compliancePassRate * 100)}%
        </li>
        <li>
          <strong>Grant matches:</strong> {r.grantMatches}
        </li>
      </ul>
    </div>
  );
}
