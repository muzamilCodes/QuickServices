const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  details: [{ type: String }],
  basePrice: { type: Number, required: true },
  priceUnit: { type: String, default: 'visit' },
  pricingUnit: { type: String, default: 'per_visit' },
  hourlyRate: { type: Number, default: 0 },
  minDurationHours: { type: Number, default: 1 },
  additionalTimeBilling: { type: String, default: '1 hour' },
  visitingCharges: { type: Number, default: 0 },
  materialCharges: { type: Number, default: 0 },
  estimatedLabourCost: { type: Number, default: 0 },
  totalEstimatedPrice: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  category: { type: String, default: 'General Maintenance' },
  image: { type: String, default: '' },
  isProviderSubmitted: { type: Boolean, default: false },
  submittedBy: { type: String, default: '' },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);

