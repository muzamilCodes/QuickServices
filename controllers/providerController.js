const Provider = require('../models/Provider');
const User = require('../models/userModel');

// ===================== GET ALL PROVIDERS =====================
exports.getProviders = async (req, res) => {
    try {
        const { service, city, page = 1, limit = 10 } = req.query;

        const query = { isApproved: true, isAvailable: true };
        if (service) query.services = service;
        if (city) query['location.city'] = city;

        const providers = await Provider.find(query)
            .populate('userId', 'username email')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Provider.countDocuments(query);

        res.json({
            success: true,
            providers,
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

// ===================== GET PROVIDER BY ID =====================
exports.getProviderById = async (req, res) => {
    try {
        const { providerId } = req.params;

        const provider = await Provider.findById(providerId)
            .populate('userId', 'username email');

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        res.json({ success: true, provider });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};