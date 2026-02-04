/**
 * Booking Model
 * MongoDB schema for resource bookings/reservations
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  resource_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.start_time;
      },
      message: 'End time must be after start time'
    }
  },
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'checked_in'],
    default: 'pending'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approval_notes: {
    type: String
  },
  rejection_reason: {
    type: String
  },
  is_recurring: {
    type: Boolean,
    default: false
  },
  recurrence_pattern: {
    type: mongoose.Schema.Types.Mixed
  },
  parent_booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  attendees_count: {
    type: Number,
    min: 1
  },
  special_requirements: {
    type: String
  },
  qr_code: {
    type: String  // Unique QR code for check-in
  },
  check_in_time: {
    type: Date
  },
  suggested_alternatives: [{
    resource_id: mongoose.Schema.Types.ObjectId,
    start_time: Date,
    end_time: Date,
    reason: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ resource_id: 1, start_time: 1, end_time: 1 });
bookingSchema.index({ user_id: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ start_time: 1 });
bookingSchema.index({ qr_code: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Booking', bookingSchema);
