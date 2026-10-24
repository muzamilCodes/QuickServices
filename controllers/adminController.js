const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Offer = require('../models/Offer');
const Contact = require('../models/Contact');
const { User } = require('../models/userModel');
const ProviderService = require('../models/ProviderService');
const AccountDeletionRequest = require('../models/AccountDeletionRequest');
const { sendNotification } = require('../utilities/notificationService');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utilities/emailService');

exports.getAllUsers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.admin === 'true') filter.isAdmin = true;
        else if (req.query.admin === 'false') filter.isAdmin = false;

        const users = await User.find(filter)
            .select('-password -otp -otpExpiry')
            .sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, mobile, isAdmin } = req.body || {};
        const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!username || !normalizedEmail || !cleanMobile) {
            return res.status(400).json({ success: false, message: 'Username, email and mobile are required' });
        }
        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            return res.status(400).json({ success: false, message: 'Mobile number must be 10 digits' });
        }

        const [existingEmail, existingMobile] = await Promise.all([
            User.findOne({ email: normalizedEmail }),
            User.findOne({ mobile: cleanMobile })
        ]);
        if (existingEmail) return res.status(400).json({ success: false, message: 'A user with this email already exists' });
        if (existingMobile) return res.status(400).json({ success: false, message: 'A user with this mobile already exists' });

        // Admin-created accounts get a one-time password the admin can share; the
        // user is expected to change it via Forgot Password after first login.
        const tempPassword = `Qs${Math.floor(100000 + Math.random() * 900000)}!${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

        const user = await User.create({
            username: String(username).trim(),
            email: normalizedEmail,
            mobile: cleanMobile,
            password: await bcrypt.hash(tempPassword, 12),
            isAdmin: Boolean(isAdmin),
            role: isAdmin ? 'admin' : 'customer',
            isVerified: true,
            isActive: true
        });

        let emailSent = false;
        try {
            await sendEmail(
                normalizedEmail,
                'QuickServices: Your account is ready',
                `<p>Hello ${user.username},</p><p>An account has been created for you on QuickServices Kashmir.</p><p>Email: <b>${user.email}</b><br/>Temporary password: <b>${tempPassword}</b></p><p>Please sign in and reset your password from the login page.</p>`,
                `Your QuickServices account is ready. Temporary password: ${tempPassword}`
            );
            emailSent = true;
        } catch (emailError) {
            console.error('ADMIN CREATE USER EMAIL ERROR:', emailError?.message || emailError);
        }

        const { password: _pw, ...safeUser } = user.toObject();
        return res.status(201).json({
            success: true,
            message: emailSent ? 'User created and credentials emailed.' : 'User created. Share the temporary password below.',
            user: safeUser,
            tempPassword
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const { mobile, address } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (mobile) user.mobile = mobile;
        if (address) {
            if (!user.address) user.address = {};
            if (address.street) user.address.street = address.street;
            if (address.city) user.address.city = address.city;
            if (address.state) user.address.state = address.state;
            if (address.pincode) user.address.pincode = address.pincode;
        }

        await user.save();
        res.json({ success: true, message: 'User details updated', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isAdmin } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isAdmin = isAdmin;
        await user.save();
        res.json({ success: true, message: 'User admin status updated', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserActive = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();
        res.json({ success: true, message: 'User active status updated', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Remove the provider profile and its submitted services too, otherwise a
        // leftover Provider row can relink a future login to the deleted account.
        const providers = await Provider.find({ userId });
        if (providers.length) {
            await ProviderService.deleteMany({ providerId: { $in: providers.map(p => p._id) } });
            await Provider.deleteMany({ userId });
        }
        await User.deleteOne({ _id: user._id });

        await AccountDeletionRequest.updateMany(
            { userId: user._id, status: 'pending' },
            {
                status: 'approved',
                reviewedBy: req.userId,
                reviewedAt: new Date(),
                accountSnapshot: {
                    username: user.username,
                    email: user.email,
                    mobile: user.mobile,
                    providerName: providers[0]?.name || ''
                }
            }
        );

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: GET ALL BOOKINGS =====================
exports.getAllBookings = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const mongoose = require('mongoose');

        const query = {};
        if (status && status !== 'all') query.status = status;

        if (search && search.trim()) {
            const term = search.trim();
            const isId = mongoose.Types.ObjectId.isValid(term);
            query.$or = [
                ...(isId ? [{ _id: term }] : []),
                { customerName: new RegExp(term, 'i') },
                { customerPhone: new RegExp(term, 'i') },
                { serviceType: new RegExp(term, 'i') },
                { 'address.fullAddress': new RegExp(term, 'i') },
                { 'address.city': new RegExp(term, 'i') }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('user', 'username email mobile')
            .populate('provider', 'name phone whatsappNumber isAvailable isApproved category rating serviceArea')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('getAllBookings error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: UPDATE BOOKING STATUS =====================
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, providerId, reason } = req.body;

        const booking = await Booking.findById(bookingId).populate('provider', 'name phone');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `This booking is already marked as ${booking.status}. Its status is locked and cannot be modified further.`
            });
        }

        const previousStatus = booking.status;
        booking.status = status;
        if (providerId) booking.provider = providerId;
        await booking.save();

        let loyaltyCoupon = null;
        // Trigger loyalty coupon generation only when status transitions to `completed`
        if (previousStatus !== 'completed' && status === 'completed') {
            const loyaltyService = require('../utilities/loyaltyService');
            loyaltyCoupon = await loyaltyService.generateLoyaltyCouponIfEligible(booking.user);
        }

        // Send notifications
        try {
            await sendNotification({
                recipient: booking.user,
                recipientRole: 'customer',
                title: `Booking ${status.toUpperCase()}`,
                message: `Your booking #${booking._id.toString().slice(-6)} status has been updated to "${status}" by Admin.${reason ? ` Note: ${reason}` : ''}`,
                type: 'general',
                bookingId: booking._id,
                io: req.io
            });

            if (booking.provider) {
                const prov = await Provider.findById(booking.provider);
                if (prov && prov.userId) {
                    await sendNotification({
                        recipient: prov.userId,
                        recipientRole: 'provider',
                        title: `Booking Updated by Admin`,
                        message: `Booking #${booking._id.toString().slice(-6)} status updated to "${status}".`,
                        type: 'general',
                        bookingId: booking._id,
                        io: req.io
                    });
                }
            }
        } catch (notifErr) {
            console.warn('Admin status update notification warning:', notifErr.message);
        }

        res.json({
            success: true,
            message: 'Booking status updated',
            booking,
            loyaltyCoupon: loyaltyCoupon ? { user: loyaltyCoupon.user, code: loyaltyCoupon.code, discountPercent: loyaltyCoupon.discountPercent, status: loyaltyCoupon.status } : null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: REASSIGN BOOKING TO ANOTHER PROVIDER =====================
exports.reassignBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { providerId, overrideReason } = req.body;

        if (!providerId) {
            return res.status(400).json({ success: false, message: 'Provider ID is required' });
        }

        const newProvider = await Provider.findById(providerId);
        if (!newProvider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        if (!newProvider.isApproved) {
            return res.status(400).json({ success: false, message: 'Cannot assign an unapproved provider' });
        }

        if (!newProvider.isAvailable && !overrideReason) {
            return res.status(400).json({
                success: false,
                message: 'Provider is currently marked offline. Please provide an explicit override reason to assign.'
            });
        }

        const booking = await Booking.findById(bookingId).populate('provider', 'name phone');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot reassign a booking that is already ${booking.status}.`
            });
        }

        const oldProvider = booking.provider;
        booking.provider = newProvider._id;
        booking.status = 'accepted';
        booking.assignedAt = new Date();
        await booking.save();

        // Send notifications to all parties
        try {
            // Customer
            await sendNotification({
                recipient: booking.user,
                recipientRole: 'customer',
                title: 'Provider Reassigned',
                message: `Your booking #${booking._id.toString().slice(-6)} has been reassigned to ${newProvider.name}.`,
                type: 'booking_reassigned',
                bookingId: booking._id,
                io: req.io
            });

            // New Provider
            if (newProvider.userId) {
                await sendNotification({
                    recipient: newProvider.userId,
                    recipientRole: 'provider',
                    title: 'New Booking Assigned by Admin',
                    message: `Admin assigned booking #${booking._id.toString().slice(-6)} (${booking.serviceType}) to you for customer ${booking.customerName}.`,
                    type: 'booking_reassigned',
                    bookingId: booking._id,
                    io: req.io
                });
            }

            // Old Provider
            if (oldProvider && oldProvider._id && String(oldProvider._id) !== String(newProvider._id)) {
                const oldDoc = await Provider.findById(oldProvider._id);
                if (oldDoc && oldDoc.userId) {
                    await sendNotification({
                        recipient: oldDoc.userId,
                        recipientRole: 'provider',
                        title: 'Booking Reassigned',
                        message: `Booking #${booking._id.toString().slice(-6)} was reassigned to another specialist by Admin.`,
                        type: 'booking_reassigned',
                        bookingId: booking._id,
                        io: req.io
                    });
                }
            }
        } catch (notifErr) {
            console.warn('Reassign notification error:', notifErr.message);
        }

        return res.json({
            success: true,
            message: `Booking successfully reassigned to ${newProvider.name}`,
            booking
        });
    } catch (error) {
        console.error('reassignBooking error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: RESCHEDULE BOOKING =====================
exports.rescheduleBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { preferredDate, preferredTime, reason } = req.body;

        if (!preferredDate || !preferredTime) {
            return res.status(400).json({ success: false, message: 'preferredDate and preferredTime are required' });
        }

        const booking = await Booking.findById(bookingId).populate('provider', 'name');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot reschedule a booking that is already ${booking.status}.`
            });
        }

        // Validate that provider does not have a conflict on that date/time
        if (booking.provider) {
            const pDate = new Date(preferredDate);
            const startOfDay = new Date(pDate); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(pDate); endOfDay.setHours(23, 59, 59, 999);
            const conflict = await Booking.findOne({
                _id: { $ne: booking._id },
                provider: booking.provider._id,
                preferredDate: { $gte: startOfDay, $lte: endOfDay },
                preferredTime,
                status: { $in: ['accepted', 'on-the-way', 'in-progress'] }
            });

            if (conflict) {
                return res.status(400).json({
                    success: false,
                    message: `Conflict: Provider is already booked for ${preferredTime} on that date.`
                });
            }
        }

        booking.preferredDate = new Date(preferredDate);
        booking.preferredTime = preferredTime;
        await booking.save();

        // Send notifications
        try {
            await sendNotification({
                recipient: booking.user,
                recipientRole: 'customer',
                title: 'Booking Rescheduled',
                message: `Your booking #${booking._id.toString().slice(-6)} has been rescheduled to ${new Date(preferredDate).toLocaleDateString()} at ${preferredTime}.${reason ? ` Reason: ${reason}` : ''}`,
                type: 'booking_rescheduled',
                bookingId: booking._id,
                io: req.io
            });

            if (booking.provider) {
                const prov = await Provider.findById(booking.provider._id || booking.provider);
                if (prov && prov.userId) {
                    await sendNotification({
                        recipient: prov.userId,
                        recipientRole: 'provider',
                        title: 'Booking Rescheduled',
                        message: `Booking #${booking._id.toString().slice(-6)} has been rescheduled to ${new Date(preferredDate).toLocaleDateString()} at ${preferredTime}.`,
                        type: 'booking_rescheduled',
                        bookingId: booking._id,
                        io: req.io
                    });
                }
            }
        } catch (notifErr) {
            console.warn('Reschedule notification error:', notifErr.message);
        }

        return res.json({
            success: true,
            message: 'Booking rescheduled successfully',
            booking
        });
    } catch (error) {
        console.error('rescheduleBooking error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findByIdAndDelete(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: GET ALL PROVIDERS =====================
exports.getAllProviders = async (req, res) => {
    try {
        const { isApproved, page = 1, limit = 20 } = req.query;

        const query = {};
        if (isApproved !== undefined) query.isApproved = isApproved === 'true';

        const providers = await Provider.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });

        res.json({ success: true, providers });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: APPROVE PROVIDER =====================
exports.approveProvider = async (req, res) => {
    try {
        const { providerId } = req.params;

        const provider = await Provider.findById(providerId);
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        provider.isApproved = true;
        await provider.save();

        // Also ensure linked user has role = 'provider'
        let user = null;
        if (provider.userId) {
            user = await User.findById(provider.userId);
            if (user && user.role !== 'provider') {
                user.role = 'provider';
                await user.save();
            }
        }

        const recipientEmails = new Set();
        if (provider.email) recipientEmails.add(provider.email.trim().toLowerCase());
        if (user && user.email) recipientEmails.add(user.email.trim().toLowerCase());

        let emailsSent = 0;
        const sendEmail = require('../utilities/emailService');

        for (const recipient of recipientEmails) {
            try {
                console.log(`Sending approval email to: ${recipient}`);
                await sendEmail(
                    recipient,
                    "🎉 QuickServices: Your Service Provider Account Has Been Approved!",
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
                        <h2 style="color: #0f62c9; margin-top: 0;">Congratulations, ${provider.name}!</h2>
                        <p style="font-size: 15px; color: #334155; line-height: 1.6;">Your Service Provider registration for <strong>${provider.category}</strong> has been <strong>APPROVED</strong> by QuickServices Admin.</p>
                        <p style="font-size: 14px; color: #475569; line-height: 1.6;">You can now log in to your account and access your dedicated <strong>Provider Dashboard</strong> to manage your services, add pricing, and receive live customer bookings.</p>
                        <div style="margin: 28px 0; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'https://quick-services-indol.vercel.app'}/login" style="background: linear-gradient(135deg, #0f62c9, #ff8a3d); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">
                                Login to Provider Workspace →
                            </a>
                        </div>
                        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">QuickServices Home Support • Faster Doorstep Services</p>
                    </div>`,
                    `Congratulations, ${provider.name}! Your Service Provider account on QuickServices has been approved by the Admin. Please log in to your Pro Dashboard.`
                );
                emailsSent++;
            } catch (emailErr) {
                console.error(`Failed to send approval email to ${recipient}:`, emailErr);
            }
        }

        res.json({ 
            success: true, 
            message: `Provider approved successfully! Notification sent to ${Array.from(recipientEmails).join(', ')}`, 
            provider,
            emailsSent 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: REJECT PROVIDER =====================
exports.rejectProvider = async (req, res) => {
    try {
        const { providerId } = req.params;

        const provider = await Provider.findById(providerId);
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        provider.isApproved = false;
        await provider.save();

        res.json({ success: true, message: 'Provider unapproved/rejected', provider });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: SERVICES CRUD =====================
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find({}).sort({ createdAt: -1 });
        res.json({ success: true, services });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json({ success: true, service });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findOneAndUpdate({ _id: id }, req.body, { new: true });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, service });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByIdAndDelete(id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, message: 'Service deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: OFFERS CRUD =====================
exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.find({}).sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: CONTACTS =====================
exports.getContacts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const contacts = await Contact.find({})
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Contact.countDocuments();

        res.json({
            success: true,
            contacts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const contact = await Contact.findByIdAndDelete(contactId);
        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const offer = new Offer(req.body);
        await offer.save();
        res.status(201).json({ success: true, offer });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findOneAndUpdate({ _id: id }, req.body, { new: true });
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }
        res.json({ success: true, offer });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findByIdAndDelete(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }
        res.json({ success: true, message: 'Offer deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: GET DASHBOARD STATS =====================
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const totalProviders = await Provider.countDocuments();
        const pendingProviders = await Provider.countDocuments({ isApproved: false });

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'username email mobile')
            .populate('provider', 'name phone whatsappNumber')
            .sort({ createdAt: -1 })
            .limit(5);
        // recent contacts count (for quick overview)
        const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalBookings,
                pendingBookings,
                completedBookings,
                totalProviders,
                pendingProviders
            },
            recentBookings,
            recentContacts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: PROVIDER SERVICE SUBMISSIONS =====================

// Get all provider-submitted services (pending/approved/rejected)
exports.getProviderServiceSubmissions = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const submissions = await ProviderService.find(query)
            .populate('providerId', 'name email phone')
            .sort({ createdAt: -1 });
        res.json({ success: true, submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin approves a provider-submitted service → adds to global Service catalog
exports.approveProviderService = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const submission = await ProviderService.findById(id);
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

        // Mark as approved
        submission.status = 'approved';
        submission.adminNote = adminNote || '';
        submission.approvedAt = new Date();
        await submission.save();

        // Add or update in the main Service catalog (so it appears on home page & booking)
        const serviceId = `prov_${submission.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${Date.now()}`;
        const existing = await Service.findOne({ name: submission.name });
        let activeServiceId = serviceId;

        if (!existing) {
            await Service.create({
                id: serviceId,
                name: submission.name,
                icon: submission.icon || '🔧',
                description: submission.description,
                details: submission.details || [],
                basePrice: submission.price,
                priceUnit: submission.priceUnit || 'visit',
                pricingUnit: submission.pricingUnit || 'per_visit',
                hourlyRate: submission.hourlyRate || 0,
                minDurationHours: submission.minDurationHours || 1,
                additionalTimeBilling: submission.additionalTimeBilling || '1 hour',
                visitingCharges: submission.visitingCharges || 0,
                materialCharges: submission.materialCharges || 0,
                estimatedLabourCost: submission.estimatedLabourCost || submission.price,
                totalEstimatedPrice: submission.totalEstimatedPrice || submission.price,
                rating: 4.8,
                category: submission.category,
                image: submission.image || '',
                isProviderSubmitted: true,
                submittedBy: submission.providerName,
                providerId: submission.providerId
            });
        } else {
            activeServiceId = existing.id;
            existing.basePrice = submission.price;
            existing.priceUnit = submission.priceUnit || existing.priceUnit;
            existing.pricingUnit = submission.pricingUnit || existing.pricingUnit || 'per_visit';
            existing.hourlyRate = submission.hourlyRate || 0;
            existing.minDurationHours = submission.minDurationHours || 1;
            existing.additionalTimeBilling = submission.additionalTimeBilling || '1 hour';
            existing.visitingCharges = submission.visitingCharges || 0;
            existing.materialCharges = submission.materialCharges || 0;
            existing.estimatedLabourCost = submission.estimatedLabourCost || submission.price;
            existing.totalEstimatedPrice = submission.totalEstimatedPrice || submission.price;
            existing.description = submission.description;
            existing.category = submission.category;
            existing.details = submission.details || existing.details;
            if (submission.image) existing.image = submission.image;
            existing.isProviderSubmitted = true;
            existing.submittedBy = submission.providerName;
            existing.providerId = submission.providerId;
            await existing.save();
        }

        // Also update provider customServices status to approved and add to services array
        let provider = null;
        if (submission.providerId) {
            provider = await Provider.findById(submission.providerId);
        }
        if (!provider && submission.providerEmail) {
            provider = await Provider.findOne({ email: submission.providerEmail.toLowerCase().trim() });
        }

        if (provider) {
            provider.services = provider.services || [];
            if (!provider.services.includes(submission.name)) {
                provider.services.push(submission.name);
            }
            if (!provider.services.includes(activeServiceId)) {
                provider.services.push(activeServiceId);
            }

            if (provider.customServices) {
                const svcIdx = provider.customServices.findIndex(
                    cs => cs.name.toLowerCase() === submission.name.toLowerCase() ||
                          (cs.submissionId && String(cs.submissionId) === String(submission._id))
                );
                if (svcIdx >= 0) {
                    provider.customServices[svcIdx].status = 'approved';
                    provider.customServices[svcIdx].isApproved = true;
                    provider.customServices[svcIdx].pricingUnit = submission.pricingUnit || 'per_visit';
                    provider.customServices[svcIdx].hourlyRate = submission.hourlyRate || 0;
                    provider.customServices[svcIdx].minDurationHours = submission.minDurationHours || 1;
                    provider.customServices[svcIdx].additionalTimeBilling = submission.additionalTimeBilling || '1 hour';
                    provider.customServices[svcIdx].visitingCharges = submission.visitingCharges || 0;
                    provider.customServices[svcIdx].materialCharges = submission.materialCharges || 0;
                    provider.customServices[svcIdx].estimatedLabourCost = submission.estimatedLabourCost || submission.price;
                    provider.customServices[svcIdx].totalEstimatedPrice = submission.totalEstimatedPrice || submission.price;
                }
            }
            await provider.save();
        }

        res.json({ success: true, message: 'Service approved and added to catalog' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin rejects a provider-submitted service
exports.rejectProviderService = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const submission = await ProviderService.findById(id);
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

        submission.status = 'rejected';
        submission.adminNote = adminNote || 'Not approved';
        await submission.save();

        // If it was previously approved into Service catalog, remove it
        await Service.deleteMany({
            $or: [
                { name: submission.name, isProviderSubmitted: true }
            ]
        });

        let provider = null;
        if (submission.providerId) {
            provider = await Provider.findById(submission.providerId);
        }
        if (!provider && submission.providerEmail) {
            provider = await Provider.findOne({ email: submission.providerEmail.toLowerCase().trim() });
        }

        if (provider && provider.customServices) {
            const svcIdx = provider.customServices.findIndex(
                cs => cs.name.toLowerCase() === submission.name.toLowerCase() ||
                      (cs.submissionId && String(cs.submissionId) === String(submission._id))
            );
            if (svcIdx >= 0) {
                provider.customServices[svcIdx].status = 'rejected';
                provider.customServices[svcIdx].isApproved = false;
                await provider.save();
            }
        }

        res.json({ success: true, message: 'Service rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
