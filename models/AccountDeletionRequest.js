const mongoose = require('mongoose');

const accountDeletionRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountType: {
        type: String,
        enum: ['customer', 'provider'],
        default: 'customer'
    },
    reason: {
        type: String,
        required: [true, 'A reason is required'],
        trim: true,
        minlength: [10, 'Please explain in at least 10 characters'],
        maxlength: 600
    },
    details: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    adminNote: {
        type: String,
        trim: true,
        maxlength: 600,
        default: ''
    },
    // Snapshot taken before the account documents are removed, so the admin
    // queue and audit trail still show who was deleted.
    accountSnapshot: {
        username: String,
        email: String,
        mobile: String,
        providerName: String
    }
}, { timestamps: true });

// One live request per account.
accountDeletionRequestSchema.index({ userId: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);
