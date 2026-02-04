/**
 * Campus Resource Booking System - Main Server File
 * Entry point for the backend application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const routes = require('./src/routes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: logger.stream })); // HTTP request logging

// API Routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'UniServe Backend',
    version: process.env.API_VERSION || 'v1',
    database: 'MongoDB'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Database connection established successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
