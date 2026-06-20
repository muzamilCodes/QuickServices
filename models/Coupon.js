const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountPercent: {
    type: Number,
    default: 50,
  },
  status: {
    type: String,
    enum: ['unused', 'used'],
    default: 'unused',
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  usedAt: Date,
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
