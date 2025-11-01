const { brandGuidanceAgentHttpTrigger } = require('../dist/brandguidanceagent/httpTrigger');

module.exports = async function (context, req) {
  // Convert Azure Functions v3 context to v4 HttpRequest/InvocationContext format
  const request = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
    json: async () => req.body
  };

  const invocationContext = {
    invocationId: context.invocationId,
    functionName: context.executionContext?.functionName || 'brandguidanceagent',
    log: (...args) => context.log(...args),
    error: (...args) => context.error(...args),
    warn: (...args) => context.warn(...args),
    info: (...args) => context.log.info(...args)
  };

  try {
    const response = await brandGuidanceAgentHttpTrigger(request, invocationContext);

    context.res = {
      status: response.status || 200,
      body: response.jsonBody || response.body,
      headers: response.headers || {}
    };
  } catch (error) {
    context.error('Function execution error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};
