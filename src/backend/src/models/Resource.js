/**
 * Resource Model
 * MongoDB schema for bookable resources
 */

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['classroom', 'laboratory', 'seminar_hall', 'auditorium', 'equipment', 'other']
  },
  capacity: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  building: {
    type: String,
    trim: true,
    maxlength: 100
  },
  floor: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  amenities: [{
    type: String
  }],
  is_available: {
    type: Boolean,
    default: true
  },
  image_url: {
    type: String,
    maxlength: 500
  },
  department: {
    type: String,
    trim: true
  },
  requires_approval: {
    type: Boolean,
    default: true
  },
  qr_code: {
    type: String  // Base64 encoded QR code
  }
}, {
  timestamps: true
});

// Index for better search performance
resourceSchema.index({ type: 1, is_available: 1 });
resourceSchema.index({ name: 'text', location: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
