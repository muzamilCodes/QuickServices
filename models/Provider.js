const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: String,
    services: [{
        type: String,
        enum: ['plumber', 'electrician', 'driver', 'cleaner', 'carpenter', 'painter', 'mechanic', 'gardener']
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
    experience: {
        type: Number,
        default: 0
    },
    description: String,
    location: {
        city: String,
        address: String,
        lat: Number,
        lng: Number
    },
    pricePerHour: Number
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);