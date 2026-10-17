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
