const express = require('express');
const path = require('path');
const app = express();

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

app.get('/savings-goals.html', (req, res) => {
    console.log('Serving SavingGoals.html for /savings-goals.html request');
    res.sendFile(path.join(__dirname, 'public', 'SavingGoals.html'));
});

// Route to serve Insight.html for /insights.html request
app.get('/insights.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Insight.html'));
});

const express = require('express');
const path = require('path');
const app = express();

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

module.exports = app;
