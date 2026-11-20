const express = require('express');
const authorize = require('../middlewares/authorize');
const router = express.Router();

// Import controllers
const {
    createBooking,
    verifyBookingOTP,
    getMyBookings,
    cancelBooking,
    deleteBooking,
    getServices,
    getBooking,
    updateLiveLocation,
    getLiveLocation,
    updateBookingStatus,
    addReview,
    addComplaint,
    requestAdditionalCharge,
    resolveAdditionalCharge
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
router.delete('/:bookingId', deleteBooking);

// Live location tracking & status updates
router.post('/:bookingId/location', updateLiveLocation);
router.get('/:bookingId/live-location', getLiveLocation);
router.put('/:bookingId/status', updateBookingStatus);

// Review, complaint, additional charge
router.post('/:bookingId/review', addReview);
router.post('/:bookingId/complaint', addComplaint);
router.post('/:bookingId/additional-charge', requestAdditionalCharge);
router.post('/:bookingId/additional-charge/resolve', resolveAdditionalCharge);

module.exports = router;