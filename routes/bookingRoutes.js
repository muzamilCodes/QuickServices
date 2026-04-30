const express = require('express');
const authorize = require('../middlewares/authorize');
const router = express.Router();

// Import controllers
const {
    createBooking,
    verifyBookingOTP,
    getMyBookings,
    cancelBooking,
    getServices,
    getBooking
} = require('../controllers/bookingController');

// All routes require authentication
router.use(authorize);

// Routes
router.get('/services', getServices);
router.post('/create', createBooking);
router.post('/verify-otp', verifyBookingOTP);
router.get('/my-bookings', getMyBookings);
router.get('/:bookingId', getBooking);
router.put('/:bookingId/cancel', cancelBooking);

module.exports = router;