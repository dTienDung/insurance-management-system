const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy tất cả /api requests đến backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy API] ${req.method} ${req.path} -> http://localhost:5000${req.path}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
      }
    })
  );

  // QUAN TRỌNG: Chuyển /auth thành /api/auth
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/auth': '/api/auth'  // ĐÂY LÀ DÒNG QUAN TRỌNG!
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy Auth] ${req.method} /auth${req.path} -> /api/auth${req.path}`);
      }
    })
  );

  // Health check endpoint
  app.use(
    '/health',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};