const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  details: [{ type: String }],
  basePrice: { type: Number, required: true },
  priceUnit: { type: String, default: 'visit' },
  rating: { type: Number, default: 4.5 },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);

