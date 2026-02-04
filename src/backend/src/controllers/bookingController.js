/**
 * Booking Controller
 * Handles booking creation, approval, and management
 */

const { Booking, Resource, User } = require('../models');
const logger = require('../utils/logger');
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

    // Generate QR code for booking
    const qrData = {
      bookingId: uuidv4(),
      resourceId: resource_id,
      userId: req.user.id,
      startTime: start_time,
      type: 'booking-checkin'
    };
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    // Create booking
    const booking = new Booking({
      resource_id,
      user_id: req.user.id,
      start_time,
      end_time,
      purpose,
      attendees_count,
      special_requirements,
      status: resource.requires_approval ? 'pending' : 'approved',
      qr_code: qrCode
    });
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

    if (booking.status !== 'pending') {
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

    booking.status = 'approved';
    booking.approved_by = req.user.id;
    booking.approval_notes = approval_notes;
    await booking.save();

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

    // Validate QR code (basic validation - compare with stored QR or validate structure)
    if (qr_code_data) {
      try {
        const qrData = JSON.parse(qr_code_data);
        if (qrData.type !== 'booking-checkin' || qrData.resourceId !== booking.resource_id._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Invalid QR code for this booking'
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
    booking.status = 'checked_in';
    booking.check_in_time = now;
    await booking.save();

    logger.info(`Booking checked in: ${booking._id}`);

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
 * Get resource utilization analytics
 * GET /api/v1/bookings/analytics/utilization
 */
exports.getUtilizationAnalytics = async (req, res, next) => {
  try {
    const { start_date, end_date, resource_type, department } = req.query;

    const matchStage = {
      status: { $in: ['approved', 'checked_in', 'completed'] }
    };

    if (start_date && end_date) {
      matchStage.start_time = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    // Overall utilization by resource type
    const utilizationByType = await Booking.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'resources',
          localField: 'resource_id',
          foreignField: '_id',
          as: 'resource'
        }
      },
      { $unwind: '$resource' },
      ...(resource_type ? [{ $match: { 'resource.type': resource_type } }] : []),
      ...(department ? [{ $match: { 'resource.department': department } }] : []),
      {
        $group: {
          _id: '$resource.type',
          total_bookings: { $sum: 1 },
          total_hours: {
            $sum: {
              $divide: [
                { $subtract: ['$end_time', '$start_time'] },
                1000 * 60 * 60
              ]
            }
          },
          checked_in_count: {
            $sum: { $cond: [{ $eq: ['$status', 'checked_in'] }, 1, 0] }
          }
        }
      },
      { $sort: { total_bookings: -1 } }
    ]);

    // Peak hours analysis
    const peakHours = await Booking.aggregate([
      { $match: matchStage },
      {
        $project: {
          hour: { $hour: '$start_time' },
          day_of_week: { $dayOfWeek: '$start_time' }
        }
      },
      {
        $group: {
          _id: { hour: '$hour', day: '$day_of_week' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Department-wise usage
    const departmentUsage = await Booking.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          total_bookings: { $sum: 1 },
          total_hours: {
            $sum: {
              $divide: [
                { $subtract: ['$end_time', '$start_time'] },
                1000 * 60 * 60
              ]
            }
          }
        }
      },
      { $sort: { total_bookings: -1 } }
    ]);

    // Most booked resources
    const topResources = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$resource_id',
          booking_count: { $sum: 1 },
          total_hours: {
            $sum: {
              $divide: [
                { $subtract: ['$end_time', '$start_time'] },
                1000 * 60 * 60
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: '_id',
          as: 'resource'
        }
      },
      { $unwind: '$resource' },
      {
        $project: {
          resource_name: '$resource.name',
          resource_type: '$resource.type',
          location: '$resource.location',
          booking_count: 1,
          total_hours: 1
        }
      },
      { $sort: { booking_count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        utilization_by_type: utilizationByType,
        peak_hours: peakHours,
        department_usage: departmentUsage,
        top_resources: topResources
      }
    });
  } catch (error) {
    next(error);
  }
};
