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

// ===================== REVERSE GEOCODE PROXY (OpenStreetMap Nominatim) =====================
router.get('/reverse-geocode', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
        }
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'QuickServicesKashmir/1.0 (contact@quickserviceskashmir.com)'
            }
        });
        if (!response.ok) {
            throw new Error(`Nominatim responded with status ${response.status}`);
        }
        const data = await response.json();
        const address = data.address || {};
        const road = address.road || address.pedestrian || address.street || '';
        const suburb = address.suburb || address.neighbourhood || address.residential || '';
        const city = address.city || address.town || address.village || address.county || address.state_district || 'Srinagar';
        const state = address.state || 'Jammu and Kashmir';
        const pincode = address.postcode || '';
        const parts = [road, suburb, city, state, pincode].filter(Boolean);
        const fullAddress = parts.length > 0 ? parts.join(', ') : (data.display_name || `${lat}, ${lng}`);

        return res.json({
            success: true,
            address: {
                fullAddress,
                city,
                pincode,
                state,
                lat: Number(lat),
                lng: Number(lng),
                raw: address
            }
        });
    } catch (err) {
        console.error('Reverse geocode error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to reverse geocode coordinates' });
    }
});

// ===================== GET SERVICE & PROVIDER DETAILS WITH AVAILABILITY =====================
router.get('/service-details/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { date } = req.query; // optional date YYYY-MM-DD
        const mongoose = require('mongoose');
        const Service = require('../models/Service');
        const ProviderService = require('../models/ProviderService');
        const Provider = require('../models/Provider');
        const Booking = require('../models/Booking');

        const isObjId = mongoose.Types.ObjectId.isValid(serviceId);

        // 1. Fetch Service from Service model
        let serviceDoc = await Service.findOne({
            $or: [
                { id: serviceId },
                { name: new RegExp(`^${serviceId.replace(/[-_]/g, ' ')}$`, 'i') },
                ...(isObjId ? [{ _id: serviceId }] : [])
            ]
        }).populate('providerId');

        // 2. Fallback to ProviderService model
        if (!serviceDoc) {
            const provSubmission = await ProviderService.findOne({
                $or: [
                    ...(isObjId ? [{ _id: serviceId }] : []),
                    { name: new RegExp(`^${serviceId.replace(/[-_]/g, ' ')}$`, 'i') }
                ]
            }).populate('providerId');

            if (provSubmission) {
                serviceDoc = {
                    _id: provSubmission._id,
                    id: `prov_${provSubmission.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
                    name: provSubmission.name,
                    icon: provSubmission.icon || '🔧',
                    description: provSubmission.description,
                    details: provSubmission.details || [],
                    basePrice: provSubmission.price,
                    priceUnit: provSubmission.priceUnit || 'visit',
                    pricingUnit: provSubmission.pricingUnit || 'per_visit',
                    hourlyRate: provSubmission.hourlyRate || 0,
                    minDurationHours: provSubmission.minDurationHours || 1,
                    additionalTimeBilling: provSubmission.additionalTimeBilling || '1 hour',
                    visitingCharges: provSubmission.visitingCharges || 0,
                    materialCharges: provSubmission.materialCharges || 0,
                    estimatedLabourCost: provSubmission.estimatedLabourCost || provSubmission.price,
                    totalEstimatedPrice: provSubmission.totalEstimatedPrice || provSubmission.price,
                    rating: 4.8,
                    category: provSubmission.category,
                    image: provSubmission.image || '',
                    isProviderSubmitted: true,
                    submittedBy: provSubmission.providerName,
                    providerId: provSubmission.providerId
                };
            }
        }

        // 3. Fallback to default catalog services if known key (e.g. plumber, electrician)
        if (!serviceDoc) {
            const defaults = {
                plumber: { id: 'plumber', name: 'Plumbing & Leak Repair', icon: '🔧', category: 'Plumbing', description: 'Leak repair, tap fitting, blocked drains and bathroom plumbing solutions.', details: ['Leak repair', 'Tap fitting', 'Drain cleaning'], basePrice: 499, priceUnit: 'visit', rating: 4.9 },
                electrician: { id: 'electrician', name: 'Certified Electrical Works', icon: '⚡', category: 'Electrical works', description: 'Switchboards, fans, lights, wiring faults and complete home electrical setup.', details: ['Fan fitting', 'Wiring faults', 'Switchboard repair'], basePrice: 499, priceUnit: 'visit', rating: 4.9 },
                cleaner: { id: 'cleaner', name: 'Home Complete Cleaning Solutions', icon: '🧹', category: 'Cleaning', description: 'Full home cleaning, sanitized floors, deep bathroom and kitchen scrub.', details: ['Home cleaning', 'Office cleaning', 'Deep cleaning'], basePrice: 399, priceUnit: 'room', rating: 4.8 },
                painter: { id: 'painter', name: 'House Painting & Wall Primer', icon: '🎨', category: 'Painting', description: 'Interior/exterior premium paint finishing, texture work and waterproofing.', details: ['Full room paint', 'Wall primer', 'Texture coating'], basePrice: 899, priceUnit: 'room', rating: 4.7 },
                carpenter: { id: 'carpenter', name: 'Expert Woodwork & Furniture Repair', icon: '🪚', category: 'Carpentry', description: 'Door fixes, latch fittings, custom wooden wardrobes and furniture assembly.', details: ['Door adjustments', 'Hinges & locks', 'Wood restoration'], basePrice: 599, priceUnit: 'visit', rating: 4.8 },
                appliance: { id: 'appliance', name: 'Appliance Repair & Maintenance', icon: '❄️', category: 'Appliance Repair', description: 'AC gas refill, refrigerator, washing machine and microwave servicing.', details: ['AC servicing', 'Fridge coolant', 'Washing machine'], basePrice: 449, priceUnit: 'device', rating: 4.8 },
            };

            const key = serviceId.toLowerCase();
            if (defaults[key]) {
                serviceDoc = defaults[key];
            }
        }

        if (!serviceDoc) {
            return res.status(404).json({
                success: false,
                message: `Service '${serviceId}' not found in the QuickServices catalog.`
            });
        }

        // 4. Resolve Provider
        let provider = null;
        if (serviceDoc.providerId && serviceDoc.providerId._id) {
            provider = serviceDoc.providerId;
        } else if (serviceDoc.providerId && mongoose.Types.ObjectId.isValid(serviceDoc.providerId)) {
            provider = await Provider.findById(serviceDoc.providerId);
        }

        if (!provider) {
            // Find an approved provider offering this service
            provider = await Provider.findOne({
                services: { $in: [serviceDoc.id, serviceDoc.name, serviceId] },
                isApproved: true
            }).sort({ isAvailable: -1, rating: -1 });
        }

        if (!provider) {
            // Fallback to any approved provider matching category or top approved provider
            provider = await Provider.findOne({
                isApproved: true,
                category: serviceDoc.category || 'General Maintenance'
            }).sort({ isAvailable: -1, rating: -1 });

            if (!provider) {
                provider = await Provider.findOne({ isApproved: true }).sort({ isAvailable: -1, rating: -1 });
            }
        }

        // 5. Compute Real Availability Status
        // Possible statuses: AVAILABLE, BUSY, OFFLINE, UNAVAILABLE, BOOKED
        let availabilityStatus = 'AVAILABLE';
        let availabilityReason = 'Service provider is online and accepting booking requests.';
        let estimatedArrival = '30 - 45 mins';

        if (!provider) {
            availabilityStatus = 'UNAVAILABLE';
            availabilityReason = 'No verified service provider is currently assigned to this service.';
            estimatedArrival = 'Currently unavailable';
        } else if (!provider.isApproved) {
            availabilityStatus = 'UNAVAILABLE';
            availabilityReason = 'Provider profile verification is pending review.';
            estimatedArrival = 'Currently unavailable';
        } else if (provider.isAvailable === false) {
            availabilityStatus = 'OFFLINE';
            availabilityReason = `${provider.name} is currently offline. You can choose a future time slot.`;
            estimatedArrival = 'Next available working day';
        } else {
            // Check active ongoing bookings right now
            const ongoingBooking = await Booking.findOne({
                provider: provider._id,
                status: { $in: ['accepted', 'on-the-way', 'in-progress'] }
            });

            if (ongoingBooking) {
                availabilityStatus = 'BUSY';
                availabilityReason = `${provider.name} is currently attending an in-progress service job. You can schedule for an upcoming slot today or future date.`;
                estimatedArrival = '~1.5 - 2 hours';
            }
        }

        // 6. Time Slot Calculation for Date
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const standardSlots = [
            '09:00 AM - 11:00 AM',
            '11:00 AM - 01:00 PM',
            '02:00 PM - 04:00 PM',
            '04:00 PM - 06:00 PM',
            '06:00 PM - 08:00 PM'
        ];

        let bookedSlots = [];
        if (provider) {
            const bookingsOnDate = await Booking.find({
                provider: provider._id,
                preferredDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['accepted', 'on-the-way', 'in-progress', 'pending'] }
            }).select('preferredTime');
            bookedSlots = bookingsOnDate.map(b => b.preferredTime).filter(Boolean);
        }

        const availableSlots = standardSlots.map(slot => ({
            time: slot,
            available: !bookedSlots.includes(slot) && availabilityStatus !== 'UNAVAILABLE'
        }));

        // Format clean provider info (without leaking sensitive credentials)
        const providerData = provider ? {
            _id: provider._id,
            name: provider.name,
            profilePicture: provider.profilePicture || '/hero-user.jpg',
            phone: provider.phone,
            whatsappNumber: provider.whatsappNumber || provider.phone,
            rating: provider.rating || 4.8,
            totalRatings: provider.totalRatings || 15,
            isApproved: provider.isApproved,
            isAvailable: provider.isAvailable !== false,
            serviceArea: provider.serviceArea || 'Srinagar & Handwara Kashmir',
            category: provider.category,
            experience: provider.experience || 2,
            qualifications: provider.qualifications || 'Certified Professional Specialist',
            workingHours: provider.availability?.hours || '08:00 AM - 08:00 PM',
            workingDays: provider.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            location: provider.location || { city: 'Srinagar', address: 'Kashmir', lat: 34.0837, lng: 74.7973 }
        } : null;

        return res.json({
            success: true,
            service: {
                _id: serviceDoc._id,
                id: serviceDoc.id || serviceDoc._id,
                name: serviceDoc.name,
                icon: serviceDoc.icon || '🔧',
                category: serviceDoc.category || 'General Maintenance',
                image: serviceDoc.image || '',
                description: serviceDoc.description,
                details: serviceDoc.details || [],
                basePrice: serviceDoc.basePrice || serviceDoc.price || 499,
                priceUnit: serviceDoc.priceUnit || 'visit',
                pricingUnit: serviceDoc.pricingUnit || 'per_visit',
                hourlyRate: serviceDoc.hourlyRate || 0,
                minDurationHours: serviceDoc.minDurationHours || 1,
                additionalTimeBilling: serviceDoc.additionalTimeBilling || '1 hour',
                visitingCharges: serviceDoc.visitingCharges || 0,
                materialCharges: serviceDoc.materialCharges || 0,
                estimatedLabourCost: serviceDoc.estimatedLabourCost || serviceDoc.basePrice || 499,
                totalEstimatedPrice: serviceDoc.totalEstimatedPrice || serviceDoc.basePrice || 499,
                rating: serviceDoc.rating || 4.8,
                isProviderSubmitted: !!serviceDoc.isProviderSubmitted,
                submittedBy: serviceDoc.submittedBy || (provider ? provider.name : '')
            },
            provider: providerData,
            availability: {
                status: availabilityStatus,
                reason: availabilityReason,
                estimatedArrival,
                workingHours: providerData?.workingHours || '08:00 AM - 08:00 PM',
                workingDays: providerData?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                availableSlots
            }
        });
    } catch (error) {
        console.error('getServiceDetails error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
module.exports.getPublicServices = getPublicServices;

