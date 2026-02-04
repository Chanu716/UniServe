/**
 * Resource Controller
 * Handles CRUD operations for resources
 */

const { Resource } = require('../models');
const logger = require('../utils/logger');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all resources with filtering
 * GET /api/v1/resources
 */
exports.getResources = async (req, res, next) => {
  try {
    const {
      type,
      capacity_min,
      capacity_max,
      location,
      building,
      department,
      amenities,
      is_available,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (building) query.building = building;
    if (department) query.department = department;
    if (is_available !== undefined) query.is_available = is_available === 'true';
    
    if (capacity_min || capacity_max) {
      query.capacity = {};
      if (capacity_min) query.capacity.$gte = parseInt(capacity_min);
      if (capacity_max) query.capacity.$lte = parseInt(capacity_max);
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [resources, count] = await Promise.all([
      Resource.find(query)
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ name: 1 }),
      Resource.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        resources,
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
 * Get single resource by ID
 * GET /api/v1/resources/:id
 */
exports.getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new resource
 * POST /api/v1/resources
 */
exports.createResource = async (req, res, next) => {
  try {
    // Generate QR code for resource
    const qrData = {
      resourceId: uuidv4(),
      type: 'resource',
      timestamp: new Date().toISOString()
    };
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    const resource = new Resource({
      ...req.body,
      qr_code: qrCode
    });
    await resource.save();

    logger.info(`Resource created: ${resource.name} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update resource
 * PUT /api/v1/resources/:id
 */
exports.updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    Object.assign(resource, req.body);
    await resource.save();

    logger.info(`Resource updated: ${resource._id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resource
 * DELETE /api/v1/resources/:id
 */
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Soft delete by setting is_available to false
    resource.is_available = false;
    await resource.save();

    logger.info(`Resource deleted: ${resource._id} by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
