const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  discount: { type: Number, required: true }, // percentage or fixed amount
  discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  service: { type: String, default: 'Any service' }, // service category name
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null }, // reference to Service
  href: { type: String, default: '/services' }, // booking URL
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date, default: null }, // null means no expiry
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
