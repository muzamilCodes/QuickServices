const express = require('express');
const router = express.Router();
const sendEmail = require('../utilities/emailService');

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
        const Service = require('../models/Service');
        const now = new Date();
        
        const offers = await Offer.find({
            isActive: true,
            $or: [
                { expiryDate: null },
                { expiryDate: { $gt: now } }
            ]
        })
        .populate('serviceId', 'id name icon description basePrice')
        .sort({ createdAt: -1 });

        // Validate that services exist
        const validOffers = [];
        for (const offer of offers) {
            // If offer is for 'Any service' or service exists, include it
            if (offer.service === 'Any service' || offer.serviceId) {
                validOffers.push(offer);
            }
        }

        res.json({ success: true, offers: validOffers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/contact', async (req, res) => {
    try {
        const { name, phone, email, topic, message } = req.body;

        if (!name || !phone || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, phone, email, and message are required' });
        }

        // Persist contact to DB so admin can review messages
        try {
            const Contact = require('../models/Contact');
            const contact = new Contact({ name, phone, email, topic, message });
            await contact.save();
        } catch (err) {
            console.error('Failed saving contact to DB:', err);
            // continue to attempt to send email even if DB save fails
        }

        // Send notification email
        await sendEmail(
            process.env.EMAIL_FROM || process.env.BREVO_SMTP_USER,
            `QuickServices Contact: ${topic || 'General support'}`,
            `
                <h2>New contact message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Topic:</strong> ${topic || 'General support'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        );

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact message failed:', error);
        res.status(500).json({ success: false, message: 'Unable to send message right now' });
    }
});

module.exports = router;
