const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      changeOrigin: true,
      // Keep the /api prefix so the backend route mounted at /api/feedback matches
      // (previously the proxy removed the /api prefix which caused 404s)
      // pathRewrite: { '^/api': '' },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', details: err.message });
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin'
      }
    })
  );
};
