const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const weatherRoutes = require('./routes/weather');
const mlRoutes = require('./routes/ml-predictions');
const locationRoutes = require('./routes/locations');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080; // Changed from 5000 to 8080

console.log('🚀 Starting Hackovate Weather API...');

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/locations', locationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hackovate Weather API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hackovate Weather API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      weather: '/api/weather',
      ml: '/api/ml',
      locations: '/api/locations'
    }
  });
});

// WebSocket connections for real-time updates
wss.on('connection', (ws) => {
  console.log('📡 Client connected to WebSocket');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data.type);
      
      switch (data.type) {
        case 'subscribe':
          ws.locationId = data.locationId;
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('📡 Client disconnected from WebSocket');
  });

  // Send initial connection message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Hackovate Weather API',
    timestamp: Date.now()
  }));
});

// Broadcast weather updates to all connected clients
function broadcastWeatherUpdate(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'weather-update',
        data: data,
        timestamp: Date.now()
      }));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ API Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    message: 'This endpoint does not exist'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Hackovate Weather API running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);  
  console.log(`🔗 API URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, broadcastWeatherUpdate };
