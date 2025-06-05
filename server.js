const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy middleware for Prismic API
app.use('/api', createProxyMiddleware({
    target: 'https://zaheb.cdn.prismic.io',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api/v2'
    },
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    }
}));

// Proxy for documents endpoint
app.use('/documents', createProxyMiddleware({
    target: 'https://zaheb.cdn.prismic.io',
    changeOrigin: true,
    pathRewrite: {
        '^/documents': '/api/v2/documents'
    },
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    }
}));

// Proxy for CMA endpoints
app.use('/cma', createProxyMiddleware({
    target: 'https://customtypes.prismic.io',
    changeOrigin: true,
    pathRewrite: {
        '^/cma': '/documents'
    },
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    }
}));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
}); 