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
    profilePicture: {
        type: String,
        default: '/hero-user.jpg'
    },
    category: {
        type: String,
        default: 'General Maintenance'
    },
    services: [{
        type: String
    }],
    customServices: [{
        name: String,
        category: String,
        image: String,
        price: Number,
        priceUnit: { type: String, default: 'visit' },
        description: String,
        details: [String]
    }],
    whatsappNumber: {
        type: String
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
        default: 4.8
    },
    totalRatings: {
        type: Number,
        default: 12
    },
    experience: {
        type: Number,
        default: 2
    },
    skills: [{
        type: String
    }],
    qualifications: {
        type: String,
        default: 'Certified Professional Technician'
    },
    serviceArea: {
        type: String,
        default: 'Srinagar & Handwara Kashmir'
    },
    availability: {
        days: {
            type: [String],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        hours: {
            type: String,
            default: '08:00 AM - 08:00 PM'
        }
    },
    pricingDetails: {
        type: String,
        default: 'Starting at ₹499 per visit. Transparent upfront rates.'
    },
    description: {
        type: String,
        default: 'Experienced verified technician offering fast doorstep repair and maintenance.'
    },
    portfolio: [{
        type: String
    }],
    documents: [{
        name: String,
        url: String
    }],
    completedBookings: {
        type: Number,
        default: 0
    },
    location: {
        city: { type: String, default: 'Srinagar' },
        address: { type: String, default: 'Kashmir' },
        lat: { type: Number, default: 34.0837 },
        lng: { type: Number, default: 74.7973 }
    },
    liveLocation: {
        lat: Number,
        lng: Number,
        heading: Number,
        speed: Number,
        updatedAt: Date
    },
    pricePerHour: {
        type: Number,
        default: 499
    }
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
