const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    services: [{
        type: String,
        enum: ['plumber', 'electrician', 'driver', 'cleaner', 'carpenter', 'painter']
    }],
    whatsappNumber: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    currentLocation: {
        lat: Number,
        lng: Number,
        lastUpdated: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);