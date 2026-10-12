const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');
const opportunityRoutes = require('./routes/opportunities');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/opportunities', opportunityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'University Research Opportunity Portal API'
  });
});

// Fallback route for SPA / index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler for unhandled routes
app.use(notFoundHandler);

// Centralized Error Handler Middleware
app.use(errorHandler);

// Start Server & Test Database Connection
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Research Opportunity Portal Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);

  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️ Warning: Database connection failed. Please ensure MySQL is running and check your .env settings.');
  }
});
