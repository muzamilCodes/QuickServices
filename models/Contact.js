const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    topic: { type: String, default: 'General support' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    repliedAt: { type: Date },
    adminNote: { type: String },
    status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);
