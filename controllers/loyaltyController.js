const Booking = require('../models/Booking');
const loyaltyService = require('../utilities/loyaltyService');
const Coupon = require('../models/Coupon');

const getMyCoupons = async (req, res) => {
  try {
    const userId = req.userId;

    const coupons = await loyaltyService.getUserCoupons(userId);

    const availableCoupons = coupons.filter((c) => c.status === 'unused');

    res.json({
      success: true,
      coupons,
      availableCoupons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyLoyaltyStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const completedBookingsCount = await Booking.countDocuments({
      user: userId,
      status: 'completed',
    });

    const unusedCount = await Coupon.countDocuments({ user: userId, status: 'unused' });
    const usedCount = await Coupon.countDocuments({ user: userId, status: 'used' });

    // Mirrors loyaltyService logic: next coupon eligibility threshold depends on how many coupons were already used.
    const nextThreshold = (usedCount + 1) * 5;

    const bookingsUntilNextCoupon = completedBookingsCount >= nextThreshold ? 0 : nextThreshold - completedBookingsCount;

    res.json({
      success: true,
      stats: {
        totalCompletedBookings: completedBookingsCount,
        unusedCouponCount: unusedCount,
        usedCouponCount: usedCount,
        nextCouponThreshold: nextThreshold,
        bookingsUntilNextCoupon,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyCoupons,
  getMyLoyaltyStatus,
};

