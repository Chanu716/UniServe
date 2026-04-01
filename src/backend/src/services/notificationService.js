/**
 * Notification Service
 * Handles email delivery for booking events
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email notification
 */
const sendEmail = async (to, subject, text, html) => {
  if (process.env.NODE_ENV === 'test') {
    logger.info(`Notification service: Mock email sent to ${to}`);
    return;
  }

  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
    logger.info(`Notification service: Email notifications are disabled. Skipping email to ${to}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'UniServe'}" <${process.env.EMAIL_FROM || 'noreply@uniserve.edu'}>`,
      to,
      subject,
      text,
      html
    });

    logger.info(`Message sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    // Non-blocking failure
  }
};

/**
 * Notify user of booking request submission
 */
exports.notifyBookingRequest = async (user, booking, resource) => {
  const subject = `UniServe: Booking Request Received - ${resource.name}`;
  const html = `
    <h1>Booking Request Submitted</h1>
    <p>Hi ${user.name},</p>
    <p>Your booking request for <strong>${resource.name}</strong> has been received.</p>
    <ul>
      <li><strong>Start:</strong> ${new Date(booking.start_time).toLocaleString()}</li>
      <li><strong>End:</strong> ${new Date(booking.end_time).toLocaleString()}</li>
      <li><strong>Purpose:</strong> ${booking.purpose}</li>
      <li><strong>Status:</strong> ${booking.status}</li>
    </ul>
    <p>We will notify you once it's reviewed.</p>
  `;
  
  await sendEmail(user.email, subject, `Booking request for ${resource.name} is pending.`, html);
};

/**
 * Notify user of booking approval
 */
exports.notifyBookingApproval = async (user, booking, resource) => {
  const subject = `UniServe: Booking Approved! - ${resource.name}`;
  const html = `
    <h1>Booking Approved</h1>
    <p>Great news, ${user.name}!</p>
    <p>Your booking request for <strong>${resource.name}</strong> has been <strong>approved</strong>.</p>
    <ul>
      <li><strong>Check-in Token:</strong> ${booking.qr_code ? 'Included in your app dashboard' : 'Will be generated shortly'}</li>
      <li><strong>Location:</strong> ${resource.location}, ${resource.building}</li>
    </ul>
    <p>Please check-in using your QR code at the scheduled time.</p>
  `;
  
  await sendEmail(user.email, subject, `Booking for ${resource.name} has been approved.`, html);
};

/**
 * Notify user of booking rejection
 */
exports.notifyBookingRejection = async (user, booking, resource, reason) => {
  const subject = `UniServe: Booking Request Rejected - ${resource.name}`;
  const html = `
    <h1>Booking Request Status</h1>
    <p>Hi ${user.name},</p>
    <p>Unfortunately, your booking request for <strong>${resource.name}</strong> was not approved.</p>
    <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
    <p>You can try booking a different resource or time slot.</p>
  `;
  
  await sendEmail(user.email, subject, `Booking request for ${resource.name} was rejected.`, html);
};

/**
 * Notify user of check-in confirmation
 */
exports.notifyCheckIn = async (user, booking, resource) => {
  const subject = `UniServe: Check-in Confirmed - ${resource.name}`;
  const html = `
    <h1>Check-in Confirmed</h1>
    <p>Hi ${user.name},</p>
    <p>You have successfully checked in to <strong>${resource.name}</strong>.</p>
    <p>Enjoy your session! Don't forget to check-out if required.</p>
  `;
  
  await sendEmail(user.email, subject, `Check-in confirmed for ${resource.name}.`, html);
};
