const express = require('express');
const {
    getProviders,
    getProviderById,
    registerProvider,
    getMyProfile,
    updateMyProfile,
    getProviderBookings,
    handleBookingAction
} = require('../controllers/providerController');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/multer');

const router = express.Router();

// Public provider routes
router.get('/', getProviders);
router.post('/register', registerProvider);

// Authenticated provider profile & workflow routes
router.get('/me', authorize, getMyProfile);
router.put('/me', authorize, updateMyProfile);
router.get('/my-bookings', authorize, getProviderBookings);
router.put('/bookings/:bookingId', authorize, handleBookingAction);

// Image upload helper
router.post('/upload-image', authorize, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    return res.json({ success: true, url: publicUrl });
});

// Provider detail page
router.get('/:providerId', getProviderById);

module.exports = router;