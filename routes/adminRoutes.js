const express = require('express');
const authorize = require('../middlewares/authorize');
const admin = require('../middlewares/admin');
const {
    getAllBookings,
    updateBookingStatus,
    deleteBooking,
    getAllProviders,
    approveProvider,
    getDashboardStats,
    getServices,
    createService,
    updateService,
    deleteService,
    getOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    // contacts
    getContacts,
    deleteContact,
    getAllUsers,
    updateUserDetails,
    updateUserAdmin,
    updateUserActive,
    deleteUser
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authorize);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.put('/bookings/:bookingId', updateBookingStatus);
router.delete('/bookings/:bookingId', deleteBooking);
router.get('/providers', getAllProviders);
router.put('/providers/:providerId/approve', approveProvider);

router.get('/services', getServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

router.get('/offers', getOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

// Contacts management
router.get('/contacts', getContacts);
router.delete('/contacts/:contactId', deleteContact);

router.get('/users', getAllUsers);
router.put('/users/:userId', updateUserDetails);
router.put('/users/:userId/admin', updateUserAdmin);
router.put('/users/:userId/active', updateUserActive);
router.delete('/users/:userId', deleteUser);

module.exports = router;
