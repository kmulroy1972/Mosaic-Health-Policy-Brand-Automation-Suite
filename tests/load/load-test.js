// k6 load test script for key endpoints
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 50 }, // Stay at 50 users
    { duration: '30s', target: 0 } // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'] // Less than 1% failures
  }
};

const API_BASE = __ENV.API_BASE_URL || 'https://mhpbrandfunctions38e5971a.azurewebsites.net';

export default function () {
  // Test health endpoint
  const healthRes = http.get(`${API_BASE}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100
  });

  sleep(1);

  // Test templates endpoint
  const templatesRes = http.get(`${API_BASE}/api/templates`);
  check(templatesRes, {
    'templates status is 200': (r) => r.status === 200,
    'templates response time < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);

  // Test analytics endpoint
  const analyticsRes = http.get(`${API_BASE}/api/analytics/report`);
  check(analyticsRes, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics response time < 1000ms': (r) => r.timings.duration < 1000
  });

  sleep(1);
}
