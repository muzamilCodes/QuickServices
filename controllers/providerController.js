const Provider = require('../models/Provider');
const { User } = require('../models/userModel');
const Booking = require('../models/Booking');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ===================== REGISTER PROVIDER =====================
exports.registerProvider = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            whatsappNumber,
            category = 'General Maintenance',
            services = [],
            experience = 2,
            skills = [],
            qualifications,
            serviceArea,
            address,
            city = 'Srinagar',
            lat = 34.0837,
            lng = 74.7973,
            pricePerHour = 499,
            pricingDetails,
            availability,
            description,
            profilePicture,
            portfolio = [],
            documents = []
        } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required.' });
        }

        // 8-character multi-type strong password validator (A / a / 1 / @)
        const hasMinLen = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
        if (!hasMinLen || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter (A), one lowercase letter (a), one number (1), and one special character (@).'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanMobile = phone.replace(/\D/g, "").slice(-10);

        let user = await User.findOne({ email: normalizedEmail });
        const hashedPassword = await bcrypt.hash(password, 12);

        let provider = null;
        if (user) {
            // Check if already registered as provider
            provider = await Provider.findOne({ $or: [{ userId: user._id }, { email: normalizedEmail }] });
            user.role = 'provider';
            user.password = hashedPassword;
            user.isVerified = true;
            if (cleanMobile) user.mobile = cleanMobile;
            await user.save();
        } else {
            // Check if mobile already exists on another account
            const existingMobileUser = await User.findOne({ mobile: cleanMobile });
            if (existingMobileUser) {
                // Reuse existing user, update their email and password for provider
                user = existingMobileUser;
                user.email = normalizedEmail;
                user.role = 'provider';
                user.password = hashedPassword;
                user.isVerified = true;
                await user.save();
                provider = await Provider.findOne({ $or: [{ userId: user._id }, { email: normalizedEmail }] });
            } else {
                user = await User.create({
                    username: name.trim(),
                    email: normalizedEmail,
                    mobile: cleanMobile,
                    password: hashedPassword,
                    role: 'provider',
                    isVerified: true,
                    profilePic: profilePicture || '/hero-user.jpg',
                    address: { street: address || '', city: city || 'Srinagar', state: 'Jammu & Kashmir' }
                });
            }
        }

        // Clean services array if comma separated string
        let serviceList = Array.isArray(services) ? services : (services ? services.split(',').map(s => s.trim().toLowerCase()) : []);
        let skillList = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);

        if (provider) {
            // Update existing provider profile with newly submitted info
            provider.name = name.trim();
            provider.phone = cleanMobile;
            provider.email = normalizedEmail;
            provider.whatsappNumber = whatsappNumber ? whatsappNumber.replace(/\D/g, "").slice(-10) : cleanMobile;
            provider.category = category;
            provider.services = serviceList;
            if (experience) provider.experience = Number(experience) || 1;
            if (skills) provider.skills = skillList;
            if (qualifications) provider.qualifications = qualifications;
            if (serviceArea) provider.serviceArea = serviceArea;
            if (address || city) {
                provider.location = {
                    city: city || 'Srinagar',
                    address: address || 'Kashmir',
                    lat: Number(lat) || 34.0837,
                    lng: Number(lng) || 74.7973
                };
            }
            if (pricePerHour) provider.pricePerHour = Number(pricePerHour) || 499;
            if (pricingDetails) provider.pricingDetails = pricingDetails;
            if (description) provider.description = description;
            if (profilePicture) provider.profilePicture = profilePicture;
            provider.userId = user._id;
            await provider.save();
        } else {
            provider = await Provider.create({
                userId: user._id,
                name: name.trim(),
                phone: cleanMobile,
                email: normalizedEmail,
                whatsappNumber: whatsappNumber ? whatsappNumber.replace(/\D/g, "").slice(-10) : cleanMobile,
                category,
                services: serviceList,
                experience: Number(experience) || 1,
                skills: skillList,
                qualifications: qualifications || 'Verified Professional Technician',
                serviceArea: serviceArea || 'Srinagar & Handwara Kashmir',
                location: {
                    city: city || 'Srinagar',
                    address: address || 'Kashmir',
                    lat: Number(lat) || 34.0837,
                    lng: Number(lng) || 74.7973
                },
                pricePerHour: Number(pricePerHour) || 499,
                pricingDetails: pricingDetails || `Starting at ₹${pricePerHour || 499} per service visit.`,
                availability: availability || {
                    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    hours: '08:00 AM - 08:00 PM'
                },
                description: description || 'Certified doorstep service specialist with hands-on technical experience.',
                profilePicture: profilePicture || user.profilePic || '/hero-user.jpg',
                portfolio: Array.isArray(portfolio) ? portfolio : [],
                documents: Array.isArray(documents) ? documents : [],
                isApproved: false, // Requires admin approval
                isAvailable: true
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'Service Provider registration submitted successfully! Your profile is active and pending admin approval.',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                profilePic: user.profilePic,
                isAdmin: user.isAdmin
            },
            provider: provider
        });
    } catch (error) {
        console.error('registerProvider error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== GET CURRENT PROVIDER PROFILE =====================
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const provider = await Provider.findOne({ userId }).populate('userId', 'username email mobile profilePic role');

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider profile not found for this account.' });
        }

        return res.json({ success: true, provider });
    } catch (error) {
        console.error('getMyProfile error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== UPDATE CURRENT PROVIDER PROFILE =====================
exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const provider = await Provider.findOne({ userId });

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider profile not found' });
        }

        const allowedFields = [
            'name',
            'phone',
            'whatsappNumber',
            'category',
            'services',
            'customServices',
            'experience',
            'skills',
            'qualifications',
            'serviceArea',
            'location',
            'pricePerHour',
            'pricingDetails',
            'availability',
            'description',
            'profilePicture',
            'portfolio',
            'isAvailable'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                provider[field] = req.body[field];
            }
        }

        await provider.save();

        // Also update corresponding user fields
        const user = await User.findById(userId);
        if (user) {
            if (req.body.name) user.username = req.body.name;
            if (req.body.profilePicture) user.profilePic = req.body.profilePicture;
            if (req.body.phone) user.mobile = req.body.phone.replace(/\D/g, "").slice(-10);
            await user.save();
        }

        return res.json({ success: true, message: 'Profile updated successfully', provider });
    } catch (error) {
        console.error('updateMyProfile error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== GET ALL PROVIDERS (PUBLIC / DIRECTORY) =====================
exports.getProviders = async (req, res) => {
    try {
        const { service, city, category, search, page = 1, limit = 12 } = req.query;

        const query = { isApproved: true };
        if (service) query.services = { $in: [service.toLowerCase()] };
        if (category) query.category = new RegExp(category, 'i');
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { qualifications: new RegExp(search, 'i') }
            ];
        }

        const providers = await Provider.find(query)
            .populate('userId', 'username email profilePic')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ rating: -1, createdAt: -1 });

        const total = await Provider.countDocuments(query);

        return res.json({
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
        console.error('getProviders error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== GET PROVIDER BY ID (PUBLIC PROFILE) =====================
exports.getProviderById = async (req, res) => {
    try {
        const { providerId } = req.params;

        const provider = await Provider.findById(providerId)
            .populate('userId', 'username email profilePic');

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        return res.json({ success: true, provider });
    } catch (error) {
        console.error('getProviderById error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== GET PROVIDER'S ASSIGNED & AVAILABLE BOOKINGS =====================
exports.getProviderBookings = async (req, res) => {
    try {
        const userId = req.userId;
        const provider = await Provider.findOne({ userId });

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider record not found' });
        }

        // Assigned bookings
        const assignedBookings = await Booking.find({ provider: provider._id })
            .populate('user', 'username email mobile')
            .sort({ createdAt: -1 });

        // Available pending bookings matching provider's services that aren't assigned yet
        const availableBookings = await Booking.find({
            status: 'pending',
            provider: null,
            serviceType: { $in: provider.services }
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            assignedBookings,
            availableBookings,
            provider
        });
    } catch (error) {
        console.error('getProviderBookings error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== PROVIDER ACCEPT OR REJECT BOOKING =====================
exports.handleBookingAction = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookingId } = req.params;
        const { action } = req.body; // 'accept' | 'reject'

        const provider = await Provider.findOne({ userId });
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (action === 'accept') {
            booking.provider = provider._id;
            booking.status = 'accepted';
            booking.assignedAt = new Date();
            await booking.save();

            if (req.io) {
                req.io.to(`booking_${bookingId}`).emit('status_updated', {
                    bookingId,
                    status: 'accepted',
                    provider: {
                        name: provider.name,
                        phone: provider.phone,
                        profilePicture: provider.profilePicture
                    }
                });
            }

            return res.json({ success: true, message: 'Booking accepted!', booking });
        } else if (action === 'reject') {
            if (String(booking.provider) === String(provider._id)) {
                booking.provider = null;
                booking.status = 'pending';
                await booking.save();
            }
            return res.json({ success: true, message: 'Booking declined.', booking });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action' });
        }
    } catch (error) {
        console.error('handleBookingAction error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== PROVIDER: SUBMIT SERVICE FOR APPROVAL =====================
exports.submitServiceForApproval = async (req, res) => {
    try {
        const { name, icon, category, description, details, price, priceUnit, image } = req.body;

        if (!name || !category || !description || !price) {
            return res.status(400).json({ success: false, message: 'Name, category, description, and price are required.' });
        }

        // Find provider profile
        const ProviderService = require('../models/ProviderService');
        const provider = await Provider.findOne({ userId: req.userId });
        if (!provider) {
            return res.status(403).json({ success: false, message: 'Provider profile not found.' });
        }

        const submission = new ProviderService({
            providerId: provider._id,
            providerName: provider.name,
            providerEmail: provider.email,
            name: name.trim(),
            icon: icon || '🔧',
            category,
            description,
            details: Array.isArray(details) ? details.filter(Boolean) : [],
            price: Number(price),
            priceUnit: priceUnit || 'visit',
            image: image || '',
            status: 'pending'
        });

        await submission.save();

        return res.status(201).json({
            success: true,
            message: 'Service submitted for admin approval. You will be notified once reviewed.',
            submission
        });
    } catch (error) {
        console.error('submitServiceForApproval error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get my submitted services
exports.getMyServiceSubmissions = async (req, res) => {
    try {
        const ProviderService = require('../models/ProviderService');
        const provider = await Provider.findOne({ userId: req.userId });
        if (!provider) return res.status(403).json({ success: false, message: 'Provider profile not found.' });

        const submissions = await ProviderService.find({ providerId: provider._id }).sort({ createdAt: -1 });
        return res.json({ success: true, submissions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};