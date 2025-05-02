
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Logging middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`[Frontend Server] ${req.method} ${req.url}`);
    next();
});

// Proxy API requests to backend server
app.use('/api', (req, res, next) => {
    console.log(`[Proxy Middleware] Incoming request: ${req.method} ${req.url}`);
    next();
});
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    // Remove pathRewrite to forward /api requests as is
    // pathRewrite: {
    //     '^/api': '/api'
    // },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Forwarding request to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    onError: (err, req, res) => {
        console.error(`[Proxy Error] ${err.message}`);
        res.status(500).send('Proxy error');
    }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes by serving the appropriate HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Updated to index.html
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/savings-goals.html', (req, res) => {
    console.log('Serving SavingGoals.html for /savings-goals.html request');
    res.sendFile(path.join(__dirname, 'public', 'SavingGoals.html'));
});

// Route to serve Insight.html for /insights.html request
app.get('/insights.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Insight.html'));
});

// Fallback route - serve index.html for client-side routing support
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
