import axios from 'axios';

const API_BASE = process.env.API_BASE_URL || 'https://mhpbrandfunctions38e5971a.azurewebsites.net';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pass' | 'fail';
  responseTime: number;
  statusCode?: number;
  error?: string;
}

interface PerformanceMetrics {
  endpoint: string;
  minResponseTime: number;
  maxResponseTime: number;
  avgResponseTime: number;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
}

const results: TestResult[] = [];
const performanceMetrics: Map<string, number[]> = new Map();

async function testEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  data?: unknown
): Promise<TestResult> {
  const startTime = Date.now();
  let status: 'pass' | 'fail' = 'fail';
  let statusCode: number | undefined;
  let error: string | undefined;
  let responseTime = 0;

  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      data,
      timeout: 10000,
      validateStatus: (status: number) => status < 500 // Accept 2xx, 3xx, 4xx as pass
    };

    const response = await axios(config);
    responseTime = Date.now() - startTime;
    statusCode = response.status;
    status = response.status < 400 ? 'pass' : 'fail';

    // Track performance
    if (!performanceMetrics.has(endpoint)) {
      performanceMetrics.set(endpoint, []);
    }
    performanceMetrics.get(endpoint)!.push(responseTime);
  } catch (err) {
    responseTime = Date.now() - startTime;
    if (axios.isAxiosError(err)) {
      statusCode = err.response?.status;
      error = err.message;
    } else {
      error = String(err);
    }
  }

  return {
    endpoint,
    method,
    status,
    responseTime,
    statusCode,
    error
  };
}

async function runAllTests(): Promise<void> {
  console.log('Starting E2E API Tests...\n');

  // Health check
  results.push(await testEndpoint('/api/health', 'GET'));

  // Templates
  results.push(await testEndpoint('/api/templates', 'GET'));

  // Analytics
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
  results.push(
    await testEndpoint(
      `/api/analytics/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      'GET'
    )
  );

  // Auth validate (without token - should return 200 with valid: false)
  results.push(await testEndpoint('/api/auth/validate', 'GET'));

  // PDF validate (POST - will fail without proper payload, but checks endpoint)
  results.push(
    await testEndpoint('/api/pdf/validate', 'POST', {
      pdfBase64: 'dGVzdA=='
    })
  );

  // Compliance validate (POST)
  results.push(
    await testEndpoint('/api/compliance/validate', 'POST', {
      content: Buffer.from('<html><title>Test</title></html>').toString('base64'),
      contentType: 'html'
    })
  );

  // Generate performance metrics
  const metrics: PerformanceMetrics[] = [];
  for (const [endpoint, times] of performanceMetrics.entries()) {
    if (times.length > 0) {
      const passes = results.filter((r) => r.endpoint === endpoint && r.status === 'pass').length;
      metrics.push({
        endpoint,
        minResponseTime: Math.min(...times),
        maxResponseTime: Math.max(...times),
        avgResponseTime: times.reduce((a, b) => a + b, 0) / times.length,
        successRate: (passes / times.length) * 100,
        totalRequests: times.length,
        failedRequests: times.length - passes
      });
    }
  }

  // Print results
  console.log('\n=== Test Results ===\n');
  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(
      `${icon} ${result.method} ${result.endpoint} - ${result.statusCode || 'N/A'} (${
        result.responseTime
      }ms)`
    );
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n=== Performance Metrics ===\n');
  metrics.forEach((metric) => {
    console.log(`${metric.endpoint}:`);
    console.log(`  Min: ${metric.minResponseTime}ms`);
    console.log(`  Max: ${metric.maxResponseTime}ms`);
    console.log(`  Avg: ${Math.round(metric.avgResponseTime)}ms`);
    console.log(`  Success Rate: ${Math.round(metric.successRate)}%`);
    console.log(`  Total: ${metric.totalRequests}, Failed: ${metric.failedRequests}\n`);
  });

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);

  console.log('\n=== Summary ===');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success Rate: ${Math.round((passCount / results.length) * 100)}%`);
  console.log(`Total Time: ${totalTime}ms`);
  console.log(`Average Response Time: ${Math.round(totalTime / results.length)}ms\n`);
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { runAllTests, testEndpoint, type TestResult, type PerformanceMetrics };
