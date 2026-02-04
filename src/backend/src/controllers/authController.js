/**
 * Authentication Controller
 * Handles user authentication and registration
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

/**
 * Register new user
 * POST /api/v1/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      department,
      phone
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failed_login_attempts += 1;
      
      // Lock account if max attempts exceeded
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      if (user.failed_login_attempts >= maxAttempts) {
        user.account_locked_until = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        logger.warn(`Account locked for user: ${email}`);
      }
      
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset failed login attempts and update last login
    user.failed_login_attempts = 0;
    user.account_locked_until = null;
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * PUT /api/v1/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
