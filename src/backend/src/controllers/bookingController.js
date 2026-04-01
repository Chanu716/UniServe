/**
 * Booking Controller
 * Handles booking creation, approval, and management
 */

const { Booking, Resource, User } = require('../models');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Check for booking conflicts and find alternatives
 */
const checkConflictAndFindAlternatives = async (resourceId, startTime, endTime, excludeBookingId = null) => {
  const query = {
    resource_id: resourceId,
    status: { $in: ['pending', 'approved', 'checked_in'] },
    $or: [
      {
        start_time: { $gte: startTime, $lte: endTime }
      },
      {
        end_time: { $gte: startTime, $lte: endTime }
      },
      {
        $and: [
          { start_time: { $lte: startTime } },
          { end_time: { $gte: endTime } }
        ]
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await Booking.find(query);
  const hasConflict = conflictingBookings.length > 0;

  // If conflict exists, find alternative resources and time slots
  let alternatives = [];
  if (hasConflict) {
    const resource = await Resource.findById(resourceId);
    if (resource) {
      // Find similar resources (same type, similar capacity)
      const similarResources = await Resource.find({
        _id: { $ne: resourceId },
        type: resource.type,
        is_available: true,
        capacity: {
          $gte: Math.floor(resource.capacity * 0.8),
          $lte: Math.ceil(resource.capacity * 1.2)
        }
      }).limit(5);

      // Check availability for each similar resource
      for (const similarResource of similarResources) {
        const similarConflict = await Booking.findOne({
          resource_id: similarResource._id,
          status: { $in: ['pending', 'approved', 'checked_in'] },
          $or: [
            { start_time: { $gte: startTime, $lte: endTime } },
            { end_time: { $gte: startTime, $lte: endTime } },
            {
              $and: [
                { start_time: { $lte: startTime } },
                { end_time: { $gte: endTime } }
              ]
            }
          ]
        });

        if (!similarConflict) {
          alternatives.push({
            type: 'alternative_resource',
            resource_id: similarResource._id,
            resource_name: similarResource.name,
            location: similarResource.location,
            building: similarResource.building,
            capacity: similarResource.capacity,
            start_time: startTime,
            end_time: endTime
          });
        }
      }

      // Suggest alternative time slots (2 hours before and after)
      const duration = new Date(endTime) - new Date(startTime);
      const alternativeTimes = [
        { start: new Date(new Date(startTime).getTime() - 2 * 60 * 60 * 1000), end: new Date(new Date(endTime).getTime() - 2 * 60 * 60 * 1000) },
        { start: new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000), end: new Date(new Date(endTime).getTime() + 2 * 60 * 60 * 1000) }
      ];

      for (const timeSlot of alternativeTimes) {
        const timeConflict = await Booking.findOne({
          resource_id: resourceId,
          status: { $in: ['pending', 'approved', 'checked_in'] },
          $or: [
            { start_time: { $gte: timeSlot.start, $lte: timeSlot.end } },
            { end_time: { $gte: timeSlot.start, $lte: timeSlot.end } },
            {
              $and: [
                { start_time: { $lte: timeSlot.start } },
                { end_time: { $gte: timeSlot.end } }
              ]
            }
          ]
        });

        if (!timeConflict && timeSlot.start > new Date()) {
          alternatives.push({
            type: 'alternative_time',
            resource_id: resourceId,
            resource_name: resource.name,
            location: resource.location,
            building: resource.building,
            capacity: resource.capacity,
            start_time: timeSlot.start,
            end_time: timeSlot.end
          });
        }
      }
    }
  }

  return { hasConflict, alternatives };
};

/**
 * Get all bookings with filtering
 * GET /api/v1/bookings
 */
exports.getBookings = async (req, res, next) => {
  try {
    const {
      resource_id,
      user_id,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Apply filters
    if (resource_id) query.resource_id = resource_id;
    if (status) query.status = status;

    // Users can only see their own bookings unless they're coordinator/admin
    if (!['coordinator', 'admin', 'management'].includes(req.user.role)) {
      query.user_id = req.user.id;
    } else if (user_id) {
      query.user_id = user_id;
    }

    // Date range filter
    if (start_date && end_date) {
      query.start_time = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, count] = await Promise.all([
      Booking.find(query)
        .limit(parseInt(limit))
        .skip(skip)
        .populate('resource_id', 'name type location building')
        .populate('user_id', 'name email department')
        .populate('approved_by', 'name email')
        .sort({ start_time: 1 }),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single booking by ID
 * GET /api/v1/bookings/:id
 */
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('resource_id')
      .populate('user_id', 'name email department role')
      .populate('approved_by', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      booking.user_id._id.toString() !== req.user.id &&
      !['coordinator', 'admin', 'management'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new booking
 * POST /api/v1/bookings
 */
exports.createBooking = async (req, res, next) => {
  try {
    const { resource_id, start_time, end_time, purpose, attendees_count, special_requirements } = req.body;

    // Validate resource exists and is available
    const resource = await Resource.findById(resource_id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (!resource.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Resource is not available for booking'
      });
    }

    // Validate booking time is in the future
    if (new Date(start_time) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book resources in the past'
      });
    }

    // Check for conflicts and find alternatives
    const { hasConflict, alternatives } = await checkConflictAndFindAlternatives(
      resource_id,
      start_time,
      end_time
    );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Booking conflict detected. The resource is already booked for this time slot.',
        data: {
          alternatives: alternatives.slice(0, 5) // Return top 5 alternatives
        }
      });
    }

    // Define initial status based on role and resource requirements
    let initialStatus = 'approved';
    if (resource.requires_approval) {
      if (req.user.role === 'student') {
        initialStatus = 'pending_faculty';
      } else if (req.user.role === 'faculty') {
        // Faculty bookings might still need coordinator for high-capacity labs
        initialStatus = resource.capacity > 50 ? 'pending_coordinator' : 'pending';
      } else {
        initialStatus = 'pending';
      }
    }

    // Create booking
    const booking = new Booking({
      resource_id,
      user_id: req.user.id,
      start_time,
      end_time,
      purpose,
      attendees_count,
      special_requirements,
      status: initialStatus
    });
    await booking.save();

    // Generate QR code with the persisted booking ID so scanner can resolve it directly.
    const qrData = {
      bookingId: booking._id.toString(),
      resourceId: resource_id,
      userId: req.user.id,
      startTime: start_time,
      type: 'booking-checkin'
    };
    booking.qr_code = await QRCode.toDataURL(JSON.stringify(qrData));
    await booking.save();

    // Fetch complete booking with associations
    const completeBooking = await Booking.findById(booking._id)
      .populate('resource_id')
      .populate('user_id', 'name email');

    logger.info(`Booking created: ${booking._id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      data: { booking: completeBooking }
    });

    // Send notification (async)
    notificationService.notifyBookingRequest(req.user, booking, resource);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve booking
 * PUT /api/v1/bookings/:id/approve
 */
exports.approveBooking = async (req, res, next) => {
  try {
    const { approval_notes } = req.body;

    const booking = await Booking.findById(req.params.id).populate('resource_id');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!['pending', 'pending_faculty', 'pending_coordinator'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve booking with status: ${booking.status}`
      });
    }

    // Check for conflicts again before approving
    const { hasConflict } = await checkConflictAndFindAlternatives(
      booking.resource_id._id,
      booking.start_time,
      booking.end_time,
      booking._id
    );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Cannot approve - booking conflict detected'
      });
    }

    // Handle multi-level transition
    let nextStatus = 'approved';
    if (booking.status === 'pending_faculty') {
      // If approved by faculty, might still need coordinator for large resources
      nextStatus = booking.resource_id.capacity > 50 ? 'pending_coordinator' : 'approved';
    } else if (booking.status === 'pending_coordinator') {
      nextStatus = 'approved';
    }

    booking.status = nextStatus;
    booking.approved_by = req.user.id;
    booking.approval_notes = approval_notes;
    await booking.save();

    // Trigger notifications based on new status
    const bookingUser = await User.findById(booking.user_id);
    if (nextStatus === 'approved') {
      notificationService.notifyBookingApproval(bookingUser, booking, booking.resource_id);
    } else {
      // Notifying that it moved to next level (coordinator)
      notificationService.sendEmail(bookingUser.email, `UniServe: Booking Moved to Coordinator`, 
        `Your booking for ${booking.resource_id.name} has been approved by Faculty and is now with the Coordinator.`);
    }

    logger.info(`Booking approved: ${booking._id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject booking
 * PUT /api/v1/bookings/:id/reject
 */
exports.rejectBooking = async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status: ${booking.status}`
      });
    }

    booking.status = 'rejected';
    booking.approved_by = req.user.id;
    booking.rejection_reason = rejection_reason;
    await booking.save();

    const bookingUser = await User.findById(booking.user_id);
    const resource = await Resource.findById(booking.resource_id);
    notificationService.notifyBookingRejection(bookingUser, booking, resource, rejection_reason);

    logger.info(`Booking rejected: ${booking._id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Booking rejected',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 * PUT /api/v1/bookings/:id/cancel
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only the booking owner or admin can cancel
    if (booking.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    logger.info(`Booking cancelled: ${booking._id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search available resources for a time slot
 * GET /api/v1/bookings/available
 */
exports.searchAvailable = async (req, res, next) => {
  try {
    const { start_time, end_time, type, capacity_min, amenities } = req.query;

    if (!start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'start_time and end_time are required'
      });
    }

    // Find all resources matching criteria
    const query = { is_available: true };
    if (type) query.type = type;
    if (capacity_min) query.capacity = { $gte: parseInt(capacity_min) };
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    const resources = await Resource.find(query);

    // Check each resource for conflicts
    const availableResources = [];
    for (const resource of resources) {
      const { hasConflict } = await checkConflictAndFindAlternatives(
        resource._id,
        start_time,
        end_time
      );
      if (!hasConflict) {
        availableResources.push(resource);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        available_resources: availableResources,
        count: availableResources.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * QR Code Check-In
 * POST /api/v1/bookings/:id/checkin
 */
exports.checkInBooking = async (req, res, next) => {
  try {
    const { qr_code_data } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('resource_id')
      .populate('user_id', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking status
    if (booking.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved bookings can be checked in'
      });
    }

    // Verify booking time (allow check-in 15 minutes before start time)
    const now = new Date();
    const startTime = new Date(booking.start_time);
    const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000);
    
    if (now < fifteenMinutesBefore) {
      return res.status(400).json({
        success: false,
        message: 'Check-in is only allowed 15 minutes before the booking start time'
      });
    }

    if (now > new Date(booking.end_time)) {
      return res.status(400).json({
        success: false,
        message: 'Booking time has expired'
      });
    }

    // Validate QR code payload if provided.
    if (qr_code_data) {
      try {
        let qrData = null;

        if (typeof qr_code_data === 'string' && qr_code_data.startsWith('{')) {
          qrData = JSON.parse(qr_code_data);
        } else if (typeof qr_code_data === 'string' && qr_code_data.startsWith('booking_')) {
          qrData = { bookingId: qr_code_data.split('_')[1], type: 'booking-checkin' };
        }

        if (!qrData || qrData.type !== 'booking-checkin') {
          return res.status(400).json({
            success: false,
            message: 'Invalid QR code for this booking type'
          });
        }

        if (qrData.bookingId && qrData.bookingId !== booking._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'QR code does not match this booking'
          });
        }

        if (qrData.resourceId && qrData.resourceId !== booking.resource_id._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'QR code resource mismatch'
          });
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format'
        });
      }
    }

    // Update booking status
    // Update booking status
    booking.status = 'checked_in';
    booking.check_in_time = now;
    await booking.save();

    logger.info(`Booking checked in: ${booking._id}`);

    // Notify check-in
    notificationService.notifyCheckIn(booking.user_id, booking, booking.resource_id);

    res.status(200).json({
      success: true,
      message: 'Successfully checked in',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * QR Code Check-Out
 * POST /api/v1/bookings/:id/checkout
 */
exports.checkOutBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('resource_id')
      .populate('user_id', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Only checked-in bookings can be checked out'
      });
    }

    booking.status = 'completed';
    booking.end_time = new Date(); // Actual end time
    await booking.save();

    logger.info(`Booking checked out: ${booking._id}`);

    res.status(200).json({
      success: true,
      message: 'Successfully checked out',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};


module.exports = exports;
