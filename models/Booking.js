const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider'
    },
    serviceType: {
        type: String,
        enum: ['plumber', 'electrician', 'driver', 'cleaner', 'carpenter', 'painter', 'mechanic', 'gardener'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    address: {
        fullAddress: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        landmark: String,
        location: {
            lat: Number,
            lng: Number
        }
    },
    description: {
        type: String,
        required: true
    },
    preferredDate: Date,
    preferredTime: String,
    amount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online', 'pending'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    bookingMode: {
        type: String,
        enum: ['whatsapp', 'system', 'emergency'],
        default: 'system'
    },
    isEmergency: {
        type: Boolean,
        default: false
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    whatsappLink: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);