const express = require('express');
const router = express.Router();

// Public routes - no authentication required

// Get public services (from admin services)
router.get('/services', async (req, res) => {
    try {
        const Service = require('../models/Service');
        const services = await Service.find({}).sort({ createdAt: -1 });
        res.json({ success: true, services });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get public offers (only active and non-expired)
router.get('/offers', async (req, res) => {
    try {
        const Offer = require('../models/Offer');
        const now = new Date();
        const offers = await Offer.find({
            isActive: true,
            $or: [
                { expiryDate: null },
                { expiryDate: { $gt: now } }
            ]
        }).sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
