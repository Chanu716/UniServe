/**
 * Main Routes Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const resourceRoutes = require('./resourceRoutes');
const bookingRoutes = require('./bookingRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/resources', resourceRoutes);
router.use('/bookings', bookingRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Resource Booking System API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      auth: '/auth',
      resources: '/resources',
      bookings: '/bookings'
    }
  });
});

module.exports = router;
