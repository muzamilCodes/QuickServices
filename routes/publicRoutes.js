const express = require('express');
const router = express.Router();
const sendEmail = require('../utilities/emailService');

// Public routes - no authentication required

// Get public services (from admin & approved provider services)
const getPublicServices = async (req, res) => {
    try {
        const Service = require('../models/Service');
        let services = await Service.find({}).sort({ createdAt: -1 });
        if (!services || services.length === 0) {
            const defaultServices = [
                { id: 'plumber', name: 'Plumbing & Leak Repair', icon: '🔧', description: 'Leak repair, tap fitting, blocked drains and bathroom plumbing solutions.', details: ['Leak repair', 'Tap fitting', 'Drain cleaning'], basePrice: 499, priceUnit: 'visit', rating: 4.9 },
                { id: 'electrician', name: 'Certified Electrical Works', icon: '⚡', description: 'Switchboards, fans, lights, wiring faults and complete home electrical setup.', details: ['Fan fitting', 'Wiring faults', 'Switchboard repair'], basePrice: 499, priceUnit: 'visit', rating: 4.9 },
                { id: 'cleaner', name: 'Home Complete Cleaning Solutions', icon: '🧹', description: 'Full home cleaning, sanitized floors, deep bathroom and kitchen scrub.', details: ['Home cleaning', 'Office cleaning', 'Deep cleaning'], basePrice: 399, priceUnit: 'room', rating: 4.8 },
                { id: 'painter', name: 'House Painting & Wall Primer', icon: '🎨', description: 'Interior/exterior premium paint finishing, texture work and waterproofing.', details: ['Full room paint', 'Wall primer', 'Texture coating'], basePrice: 899, priceUnit: 'room', rating: 4.7 },
                { id: 'carpenter', name: 'Expert Woodwork & Furniture Repair', icon: '🪚', description: 'Door fixes, latch fittings, custom wooden wardrobes and furniture assembly.', details: ['Door adjustments', 'Hinges & locks', 'Wood restoration'], basePrice: 599, priceUnit: 'visit', rating: 4.8 },
                { id: 'appliance', name: 'Appliance Repair & Maintenance', icon: '❄️', description: 'AC gas refill, refrigerator, washing machine and microwave servicing.', details: ['AC servicing', 'Fridge coolant', 'Washing machine'], basePrice: 449, priceUnit: 'device', rating: 4.8 },
                { id: 'landscaping', name: 'Lawn & Garden Landscaping', icon: '🌿', description: 'Lawn mowing, hedge trimming, garden soil preparation and planting.', details: ['Lawn mowing', 'Weed cleanup', 'Plant trimming'], basePrice: 699, priceUnit: 'hour', rating: 4.7 },
                { id: 'salon', name: 'Professional Grooming & Salon at Home', icon: '✂️', description: 'Hair styling, beard grooming, facial massage and hygienic personal care.', details: ['Men haircut & beard', 'Women facial & wax', 'Head massage'], basePrice: 499, priceUnit: 'person', rating: 4.9 },
                { id: 'pest', name: 'Pest Control & Fumigation', icon: '🛡️', description: 'Termite inspection, cockroach eradication and bed bug chemical fogging.', details: ['Bed bug removal', 'Termite spray', 'Cockroach gel'], basePrice: 799, priceUnit: 'visit', rating: 4.9 },
                { id: 'ro', name: 'Water Purifier & RO Service', icon: '💧', description: 'Filter replacement, membrane service, TDS tuning and UV lamp check.', details: ['Filter change', 'Membrane swap', 'TDS calibration'], basePrice: 449, priceUnit: 'device', rating: 4.8 }
            ];
            await Service.insertMany(defaultServices);
            services = await Service.find({}).sort({ createdAt: -1 });
        }
        res.json({ success: true, services });
    } catch (error) {
        console.error('getPublicServices error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

router.get('/services', getPublicServices);
router.get('/', getPublicServices);

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
        const { name, phone, email, topic, message, website } = req.body;

        // Honeypot spam trap
        if (website) {
            return res.json({ success: true, message: 'Message sent successfully' });
        }

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

        // Send notification email (best effort)
        try {
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
        } catch (mailErr) {
            console.warn('Contact email notification skipped or failed:', mailErr?.message || mailErr);
        }

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact message failed:', error);
        res.status(500).json({ success: false, message: 'Unable to send message right now' });
    }
});

module.exports = router;
module.exports.getPublicServices = getPublicServices;
