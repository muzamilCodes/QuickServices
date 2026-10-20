const Notification = require('../models/Notification');

/**
 * Creates and dispatches an in-app notification.
 * Optionally emits via Socket.IO.
 */
async function sendNotification({
  recipient = null,
  recipientRole = 'customer',
  title,
  message,
  type = 'general',
  bookingId = null,
  metadata = {},
  io = null
}) {
  try {
    const notification = await Notification.create({
      recipient,
      recipientRole,
      title,
      message,
      type,
      bookingId,
      metadata,
      read: false
    });

    // If socket.io instance passed, broadcast immediately
    if (io) {
      if (recipient) {
        io.to(`user_${recipient}`).emit('new_notification', notification);
      }
      if (recipientRole === 'admin' || recipientRole === 'all') {
        io.to('admin_room').emit('new_notification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

module.exports = {
  sendNotification
};
