const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // May be null for broadcast admin notifications
  },
  recipientRole: {
    type: String,
    enum: ['customer', 'provider', 'admin', 'all'],
    default: 'customer'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_created',
      'booking_accepted',
      'booking_rejected',
      'provider_on_the_way',
      'eta_changed',
      'service_started',
      'service_completed',
      'booking_cancelled',
      'provider_unavailable',
      'booking_reassigned',
      'booking_rescheduled',
      'general'
    ],
    default: 'general'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
