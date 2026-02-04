/**
 * User Model
 * MongoDB schema for users with role-based access
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'coordinator', 'admin', 'management'],
    default: 'student'
  },
  department: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
  },
  failed_login_attempts: {
    type: Number,
    default: 0
  },
  account_locked_until: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  if (this.account_locked_until) {
    return new Date() < this.account_locked_until;
  }
  return false;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
