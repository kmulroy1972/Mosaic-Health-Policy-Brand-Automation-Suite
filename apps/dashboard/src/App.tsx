import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';

interface EndpointStatus {
  endpoint: string;
  status: 'ok' | 'error' | 'unknown';
  lastChecked: string;
}

interface AnalyticsData {
  summary: {
    totalRequests: number;
    successRate: number;
    errorRate: number;
    averageResponseTime: number;
  };
  endpoints: Array<{
    endpoint: string;
    requestCount: number;
    successCount: number;
    errorCount: number;
    averageDuration: number;
  }>;
  compliance: {
    totalScans: number;
    averageWcagScore: number;
  };
  brandGuidance: {
    totalRequests: number;
    averageTokensUsed: number;
    successRate: number;
  };
}

const API_BASE =
  (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL || 'https://api.mosaicpolicy.com';

function App() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpointsToCheck = [
    { name: '/api/health', path: '/api/health' },
    { name: '/api/templates', path: '/api/templates' },
    { name: '/api/brandguidanceagent', path: '/api/brandguidanceagent', method: 'POST' },
    { name: '/api/pdf/validate', path: '/api/pdf/validate', method: 'POST' },
    { name: '/api/compliance/validate', path: '/api/compliance/validate', method: 'POST' },
    { name: '/api/analytics/report', path: '/api/analytics/report' }
  ];

  useEffect(() => {
    const refreshData = () => {
      checkEndpoints();
      loadAnalytics();
    };

    refreshData();

    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkEndpoints = async () => {
    const results: EndpointStatus[] = [];

    for (const endpoint of endpointsToCheck) {
      try {
        const config = endpoint.method === 'POST' ? { method: 'POST', data: {} } : {};
        const response = await axios.get(`${API_BASE}${endpoint.path}`, {
          ...config,
          timeout: 5000,
          validateStatus: (status: number) => status < 500 // Accept 2xx, 3xx, 4xx as "ok"
        });
        results.push({
          endpoint: endpoint.name,
          status: response.status < 400 ? 'ok' : 'error',
          lastChecked: new Date().toISOString()
        });
      } catch {
        results.push({
          endpoint: endpoint.name,
          status: 'error',
          lastChecked: new Date().toISOString()
        });
      }
    }

    setEndpoints(results);
    setLoading(false);
  };

  const loadAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

      const response = await axios.get(`${API_BASE}/api/analytics/report`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format: 'json'
        }
      });
      setAnalytics(response.data);
      setError(null);
    } catch {
      setError('Failed to load analytics');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mosaic Brand Automation Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Endpoint Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Endpoint Status</h2>
            {loading ? (
              <div className="text-gray-500">Checking endpoints...</div>
            ) : (
              <div className="space-y-2">
                {endpoints.map((ep) => (
                  <div key={ep.endpoint} className="flex items-center justify-between p-2 rounded">
                    <span className="text-gray-700">{ep.endpoint}</span>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        ep.status === 'ok'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ep.status === 'ok' ? '✓ OK' : '✗ Error'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {analytics && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Summary (24h)</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Requests:</span>
                  <span className="font-semibold">{analytics.summary.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-semibold text-green-600">
                    {analytics.summary.successRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Rate:</span>
                  <span className="font-semibold text-red-600">{analytics.summary.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time:</span>
                  <span className="font-semibold">{analytics.summary.averageResponseTime}ms</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compliance & Brand Guidance */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Compliance</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Scans:</span>
                  <span className="font-semibold">{analytics.compliance.totalScans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg WCAG Score:</span>
                  <span className="font-semibold">{analytics.compliance.averageWcagScore}/100</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Brand Guidance</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Requests:</span>
                  <span className="font-semibold">{analytics.brandGuidance.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Tokens:</span>
                  <span className="font-semibold">{analytics.brandGuidance.averageTokensUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-semibold text-green-600">
                    {analytics.brandGuidance.successRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Endpoint Performance */}
        {analytics && analytics.endpoints.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Endpoint Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Errors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Duration (ms)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.endpoints.map((ep) => (
                    <tr key={ep.endpoint}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ep.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ep.requestCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {ep.successCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {ep.errorCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(ep.averageDuration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
