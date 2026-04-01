/**
 * Booking Routes
 */

const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// Validation rules
const createBookingValidation = [
  body('resource_id').isMongoId().withMessage('Valid resource ID is required'),
  body('start_time').isISO8601().withMessage('Valid start time is required'),
  body('end_time').isISO8601().withMessage('Valid end time is required'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required'),
  body('attendees_count').optional().isInt({ min: 1 }),
  validate
];

const searchAvailableValidation = [
  query('start_time').isISO8601().withMessage('Valid start time is required'),
  query('end_time').isISO8601().withMessage('Valid end time is required'),
  validate
];

const checkInValidation = [
  param('id').isMongoId().withMessage('Valid booking ID is required'),
  body('qr_code_data').optional().isString(),
  validate
];

// Routes
router.get('/available', authenticate, searchAvailableValidation, bookingController.searchAvailable);
router.get('/', authenticate, bookingController.getBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.post('/', authenticate, createBookingValidation, bookingController.createBooking);

// QR Check-in and Check-out
router.post('/:id/checkin', authenticate, checkInValidation, bookingController.checkInBooking);
router.post('/:id/checkout', authenticate, bookingController.checkOutBooking);

// Coordinator and Admin routes
router.put('/:id/approve', authenticate, authorize('coordinator', 'admin'), bookingController.approveBooking);
router.put('/:id/reject', authenticate, authorize('coordinator', 'admin'), bookingController.rejectBooking);

// User can cancel their own bookings
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
