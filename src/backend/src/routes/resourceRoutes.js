/**
 * Resource Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const resourceController = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// Validation rules
const createResourceValidation = [
  body('name').trim().notEmpty().withMessage('Resource name is required'),
  body('type').isIn(['classroom', 'laboratory', 'seminar_hall', 'auditorium', 'equipment', 'other'])
    .withMessage('Invalid resource type'),
  body('capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('location').optional().trim(),
  validate
];

// Public routes (require authentication)
router.get('/', authenticate, resourceController.getResources);
router.get('/:id', authenticate, resourceController.getResource);

// Admin only routes
router.post('/', authenticate, authorize('admin'), createResourceValidation, resourceController.createResource);
router.put('/:id', authenticate, authorize('admin'), resourceController.updateResource);
router.delete('/:id', authenticate, authorize('admin'), resourceController.deleteResource);

module.exports = router;
