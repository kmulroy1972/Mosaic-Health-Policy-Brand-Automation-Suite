import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function ClientPortal() {
  const [reports] = useState<Array<{ id: string; title: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch reports for authenticated client
    // For now, placeholder
    setLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Mosaic Client Portal</title>
        <meta name="description" content="View reports, charts, and Gamma decks" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Mosaic Client Portal</h1>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Reports</h2>
            {loading ? (
              <div className="text-gray-500">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="text-gray-500">No reports available</div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border-b pb-4">
                    <h3 className="text-lg font-medium">{report.title}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border rounded hover:bg-gray-50">View Reports</button>
              <button className="p-4 border rounded hover:bg-gray-50">View Charts</button>
              <button className="p-4 border rounded hover:bg-gray-50">View Gamma Decks</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
