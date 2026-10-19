const mongoose = require('mongoose');

// A service submitted by a Provider, pending Admin approval
const providerServiceSchema = new mongoose.Schema({
  // Who submitted it
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  providerName: { type: String, required: true },
  providerEmail: { type: String },

  // Service details
  name: { type: String, required: true },
  icon: { type: String, default: '🔧' },
  category: { type: String, required: true },
  description: { type: String, required: true },
  details: [{ type: String }],
  price: { type: Number, required: true },
  priceUnit: { type: String, default: 'visit' },

  // Enhanced pricing units & breakdown
  pricingUnit: {
    type: String,
    enum: ['per_hour', 'per_visit', 'per_day', 'per_job', 'hour', 'visit', 'day', 'job'],
    default: 'per_visit'
  },
  hourlyRate: { type: Number, default: 0 },
  minDurationHours: { type: Number, default: 1 },
  additionalTimeBilling: { type: String, default: '1 hour' }, // '30 minutes' or '1 hour'
  visitingCharges: { type: Number, default: 0 },
  materialCharges: { type: Number, default: 0 },
  estimatedLabourCost: { type: Number, default: 0 },
  totalEstimatedPrice: { type: Number, default: 0 },

  image: { type: String },

  // Approval flow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: { type: String },
  approvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ProviderService', providerServiceSchema);
