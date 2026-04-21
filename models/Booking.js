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
        enum: ['plumber', 'electrician', 'driver', 'cleaner', 'carpenter', 'painter'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    address: {
        street: String,
        city: String,
        pincode: String,
        location: {
            lat: Number,
            lng: Number
        }
    },
    description: String,
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    whatsappMode: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);