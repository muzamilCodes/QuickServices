const mongoose = require('mongoose');
const AccountDeletionRequest = require('../models/AccountDeletionRequest');
const { User } = require('../models/userModel');
const Provider = require('../models/Provider');
const ProviderService = require('../models/ProviderService');
const Booking = require('../models/Booking');
const { sendNotification } = require('../utilities/notificationService');
const { sendEmail } = require('../utilities/emailService');

const ACTIVE_BOOKING_STATUSES = ['pending', 'accepted', 'on-the-way', 'in-progress'];

function buildEmailShell(title, highlight, bodyLines) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${title}</title></head>
    <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:30px 15px;">
        <tr><td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr><td style="background:linear-gradient(135deg,#0f62c9,#ff8a3d);padding:24px 30px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">QuickServices</h1>
              <p style="margin:4px 0 0 0;color:rgba(255,255,255,0.9);font-size:13px;">${title}</p>
            </td></tr>
            <tr><td style="padding:28px 30px;">
              <h2 style="margin:0 0 14px 0;color:#1e293b;font-size:19px;">${highlight}</h2>
              ${bodyLines.map(line => `<p style="margin:0 0 12px 0;color:#475569;font-size:15px;line-height:1.6;">${line}</p>`).join('')}
            </td></tr>
            <tr><td style="background-color:#f8fafc;padding:18px 30px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; ${new Date().getFullYear()} QuickServices Platform. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
}

async function accountSummary(userId) {
    const user = await User.findById(userId).select('username email mobile role createdAt isActive');
    if (!user) return null;
    const provider = await Provider.findOne({ userId }).select('name category isApproved completedBookings rating');

    const [bookingsAsCustomer, bookingsAsProvider, activeAsCustomer, activeAsProvider] = await Promise.all([
        Booking.countDocuments({ user: userId }),
        provider ? Booking.countDocuments({ provider: provider._id }) : Promise.resolve(0),
        Booking.countDocuments({ user: userId, status: { $in: ACTIVE_BOOKING_STATUSES } }),
        provider ? Booking.countDocuments({ provider: provider._id, status: { $in: ACTIVE_BOOKING_STATUSES } }) : Promise.resolve(0)
    ]);

    return {
        user,
        provider,
        stats: {
            bookingsAsCustomer,
            bookingsAsProvider,
            activeBookings: activeAsCustomer + activeAsProvider
        }
    };
}

// ===================== USER: REQUEST ACCOUNT DELETION =====================
exports.requestAccountDeletion = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

        const rawReason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
        const details = typeof req.body.details === 'string' ? req.body.details.trim() : '';

        if (rawReason.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Please tell us why you want to delete your account (at least 10 characters).'
            });
        }
        if (details.length > 1000) {
            return res.status(400).json({ success: false, message: 'Details must be 1000 characters or fewer.' });
        }

        const user = await User.findById(userId).select('username email mobile role isAdmin');
        if (!user) return res.status(404).json({ success: false, message: 'Account not found' });
        if (user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin accounts cannot request self-deletion. Please contact the platform owner.'
            });
        }

        const provider = await Provider.findOne({ userId }).select('name');
        const accountType = provider ? 'provider' : (user.role === 'provider' ? 'provider' : 'customer');

        const existing = await AccountDeletionRequest.findOne({ userId, status: { $in: ['pending', 'rejected'] } });
        const request = existing
            ? await AccountDeletionRequest.findByIdAndUpdate(
                existing._id,
                { reason: rawReason, details, status: 'pending', requestedAt: new Date() },
                { new: true }
            )
            : await AccountDeletionRequest.create({
                userId,
                accountType,
                reason: rawReason,
                details,
                status: 'pending'
            });

        await sendNotification({
            recipient: null,
            recipientRole: 'admin',
            title: 'Account deletion request',
            message: `${provider?.name || user.username} (${accountType}) requested account deletion. Reason: ${rawReason.slice(0, 140)}`,
            type: 'account_deletion_requested',
            metadata: { requestId: request._id, accountType, requesterId: userId },
            io: req.io
        });

        return res.status(201).json({
            success: true,
            message: 'Your deletion request has been sent to our admin team. Your account stays active until an admin reviews it.',
            request
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const first = Object.values(error.errors)[0];
            return res.status(400).json({ success: false, message: first?.message || 'Invalid request' });
        }
        console.error('requestAccountDeletion error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ===================== USER: READ MY REQUEST STATUS =====================
exports.getMyDeletionRequest = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

        const request = await AccountDeletionRequest.findOne({ userId })
            .sort({ createdAt: -1 })
            .select('-accountSnapshot');

        return res.status(200).json({ success: true, request: request || null });
    } catch (error) {
        console.error('getMyDeletionRequest error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ===================== ADMIN: LIST REQUESTS =====================
exports.listDeletionRequests = async (req, res) => {
    try {
        const status = req.query.status || 'pending';
        const filter = status === 'all' ? {} : { status };

        const requests = await AccountDeletionRequest.find(filter)
            .sort({ requestedAt: -1 })
            .populate('reviewedBy', 'username email');

        const items = await Promise.all(requests.map(async (item) => {
            const request = item.toObject();
            const summary = await accountSummary(item.userId);
            return {
                ...request,
                account: summary?.user || request.accountSnapshot || null,
                provider: summary?.provider || null,
                stats: summary?.stats || {
                    bookingsAsCustomer: 0,
                    bookingsAsProvider: 0,
                    activeBookings: 0
                }
            };
        }));

        return res.status(200).json({ success: true, requests: items });
    } catch (error) {
        console.error('listDeletionRequests error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: APPROVE -> HARD DELETE ACCOUNT =====================
exports.approveDeletionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const force = req.body.force === true || req.body.force === 'true';

        const request = await AccountDeletionRequest.findById(id);
        if (!request) return res.status(404).json({ success: false, message: 'Deletion request not found' });
        if (request.status !== 'pending') {
            return res.status(409).json({ success: false, message: `This request is already ${request.status}.` });
        }

        const summary = await accountSummary(request.userId);
        if (!summary) return res.status(404).json({ success: false, message: 'Account not found' });

        if (summary.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted through this queue.' });
        }
        if (summary.stats.activeBookings > 0 && !force) {
            return res.status(409).json({
                success: false,
                message: `This account has ${summary.stats.activeBookings} active booking(s). Resolve or cancel them first, or delete anyway.`,
                activeBookings: summary.stats.activeBookings
            });
        }

        const snapshot = {
            username: summary.user.username,
            email: summary.user.email,
            mobile: summary.user.mobile,
            providerName: summary.provider?.name || ''
        };

        // Hard delete: account, its provider profile, and its submitted services.
        if (summary.provider) {
            await ProviderService.deleteMany({ providerId: summary.provider._id });
            await Provider.deleteMany({ userId: summary.user._id });
        }
        await User.deleteOne({ _id: summary.user._id });

        request.status = 'approved';
        request.reviewedBy = req.userId;
        request.reviewedAt = new Date();
        request.adminNote = typeof req.body.adminNote === 'string' ? req.body.adminNote.trim().slice(0, 600) : '';
        request.accountSnapshot = snapshot;
        await request.save();

        await sendNotification({
            recipient: null,
            recipientRole: 'admin',
            title: 'Account deleted',
            message: `${snapshot.username}${snapshot.providerName ? ` (${snapshot.providerName})` : ''} account has been deleted as per request #${String(request._id).slice(-6)}.`,
            type: 'account_deleted',
            metadata: { requestId: request._id, accountType: request.accountType },
            io: req.io
        });

        if (snapshot.email) {
            sendEmail(
                snapshot.email,
                'Your QuickServices account has been deleted',
                buildEmailShell(
                    'Account deletion completed',
                    'Your account has been permanently deleted',
                    [
                        `Hi ${snapshot.username},`,
                        'As per your request, your QuickServices account has been deleted. You will no longer be able to log in, book services, or receive updates on this account.',
                        'If you did not ask for this, please contact our support team right away so we can help you recover access.',
                        `Reason on record: ${request.reason}`
                    ]
                ),
                `Hi ${snapshot.username}, your QuickServices account has been permanently deleted as per your request.`
            ).catch(err => console.error('Account deletion email failed:', err?.message || err));
        }

        return res.status(200).json({
            success: true,
            message: `Account deleted. ${snapshot.username} has been notified by email.`,
            request
        });
    } catch (error) {
        console.error('approveDeletionRequest error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: REJECT REQUEST =====================
exports.rejectDeletionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const adminNote = typeof req.body.adminNote === 'string' ? req.body.adminNote.trim().slice(0, 600) : '';

        const request = await AccountDeletionRequest.findById(id);
        if (!request) return res.status(404).json({ success: false, message: 'Deletion request not found' });
        if (request.status !== 'pending') {
            return res.status(409).json({ success: false, message: `This request is already ${request.status}.` });
        }

        request.status = 'rejected';
        request.reviewedBy = req.userId;
        request.reviewedAt = new Date();
        request.adminNote = adminNote;
        await request.save();

        const user = await User.findById(request.userId).select('username email');
        if (user) {
            await sendNotification({
                recipient: user._id,
                recipientRole: request.accountType,
                title: 'Deletion request rejected',
                message: `Your account deletion request was not approved and your account is still active.${adminNote ? ` Admin note: ${adminNote}` : ''}`,
                type: 'account_deletion_rejected',
                metadata: { requestId: request._id },
                io: req.io
            });

            sendEmail(
                user.email,
                'Your QuickServices account deletion request',
                buildEmailShell(
                    'Account deletion request reviewed',
                    'Your account is still active',
                    [
                        `Hi ${user.username},`,
                        'We reviewed your request to delete your QuickServices account and it has not been approved.',
                        adminNote ? `Note from our team: ${adminNote}` : 'You can log in and continue using your account as usual.'
                    ]
                ),
                `Hi ${user.username}, your account deletion request was not approved. Your account is still active.`
            ).catch(err => console.error('Deletion rejection email failed:', err?.message || err));
        }

        return res.status(200).json({ success: true, message: 'Deletion request rejected.', request });
    } catch (error) {
        console.error('rejectDeletionRequest error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
