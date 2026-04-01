/**
 * Analytics Routes
 * Exposes endpoints for resource utilization and trends
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes are protected and restricted to higher roles
router.use(authenticate);
router.use(authorize('coordinator', 'admin', 'management'));

router.get('/utilization', analyticsController.getUtilization);
router.get('/peak-hours', analyticsController.getPeakHours);
router.get('/top-resources', analyticsController.getTopResources);

module.exports = router;
