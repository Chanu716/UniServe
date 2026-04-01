/**
 * Analytics Controller
 * Handles data aggregation for resource utilization, peak times, and trends
 */

const { Booking, Resource, User } = require('../models');
const logger = require('../utils/logger');

/**
 * Get core utilization metrics
 * GET /api/v1/analytics/utilization
 */
exports.getUtilization = async (req, res, next) => {
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

    // 1. Overall utilization by resource type
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
          },
          average_attendees: { $avg: '$attendees_count' }
        }
      },
      { $sort: { total_bookings: -1 } }
    ]);

    // 2. Daily booking trends
    const dailyTrends = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 30 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        utilization_by_type: utilizationByType,
        daily_trends: dailyTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get peak hours and high-demand slots
 * GET /api/v1/analytics/peak-hours
 */
exports.getPeakHours = async (req, res, next) => {
  try {
    const matchStage = {
      status: { $in: ['approved', 'checked_in', 'completed'] }
    };

    const peakHours = await Booking.aggregate([
      { $match: matchStage },
      {
        $project: {
          hour: { $hour: { $add: ["$start_time", 5.5 * 60 * 60 * 1000] } }, // Assuming IST +5:30 for example, or use UTC
          day_of_week: { $dayOfWeek: "$start_time" }
        }
      },
      {
        $group: {
          _id: { hour: '$hour', day: '$day_of_week' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.status(200).json({
      success: true,
      data: { peak_hours: peakHours }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top used resources
 * GET /api/v1/analytics/top-resources
 */
exports.getTopResources = async (req, res, next) => {
  try {
    const topResources = await Booking.aggregate([
      { $match: { status: { $in: ['approved', 'checked_in', 'completed'] } } },
      {
        $group: {
          _id: '$resource_id',
          booking_count: { $sum: 1 },
          total_hours: {
            $sum: {
              $divide: [{ $subtract: ['$end_time', '$start_time'] }, 1000 * 60 * 60]
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
          name: '$resource.name',
          type: '$resource.type',
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
      data: { top_resources: topResources }
    });
  } catch (error) {
    next(error);
  }
};
