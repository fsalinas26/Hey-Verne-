require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const sessionsRouter = require('./routes/sessions');
const storyRouter = require('./routes/story');
const analyticsRouter = require('./routes/analytics');
const bookRouter = require('./routes/book');

// API Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/story', storyRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/book', bookRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Hey Verne Backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hey Verne! Backend API',
    version: '1.0.0',
    endpoints: {
      sessions: '/api/sessions',
      story: '/api/story',
      analytics: '/api/analytics',
      book: '/api/book',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Hey Verne! Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
📁 Uploads: http://localhost:${PORT}/uploads
🌍 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

