const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Offer = require('../models/Offer');
const { User } = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
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

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: GET ALL BOOKINGS =====================
exports.getAllBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('user', 'username email')
            .populate('provider', 'name phone')
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
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN: UPDATE BOOKING STATUS =====================
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, providerId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.status = status;
        if (providerId) booking.provider = providerId;
        await booking.save();

        res.json({ success: true, message: 'Booking status updated', booking });

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

        res.json({ success: true, message: 'Provider approved successfully', provider });
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
            .populate('user', 'username')
            .sort({ createdAt: -1 })
            .limit(5);

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
            recentBookings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
