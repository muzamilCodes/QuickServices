const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'provider', 'admin'],
        default: 'user'
    },
    refreshToken: String,
    addresses: [{
        street: String,
        city: String,
        pincode: String,
        location: {
            lat: Number,
            lng: Number
        },
        isDefault: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);