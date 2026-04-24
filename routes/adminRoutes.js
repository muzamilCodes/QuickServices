const express = require('express');
const authorize = require('../middlewares/authorize');
const admin = require('../middlewares/admin');
const {
    getAllBookings,
    updateBookingStatus,
    getAllProviders,
    approveProvider,
    getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authorize);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.put('/bookings/:bookingId', updateBookingStatus);
router.get('/providers', getAllProviders);
router.put('/providers/:providerId/approve', approveProvider);

module.exports = router;