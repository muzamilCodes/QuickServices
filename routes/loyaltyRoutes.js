const express = require('express');
const authorize = require('../middlewares/authorize');
const { getMyCoupons, getMyLoyaltyStatus } = require('../controllers/loyaltyController');

const router = express.Router();

router.use(authorize);

router.get('/coupons/me', getMyCoupons);
router.get('/status/me', getMyLoyaltyStatus);

module.exports = router;

