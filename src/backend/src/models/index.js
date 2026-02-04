/**
 * Model Index
 * Exports all MongoDB models
 */

const User = require('./User');
const Resource = require('./Resource');
const Booking = require('./Booking');

module.exports = {
  User,
  Resource,
  Booking
};
