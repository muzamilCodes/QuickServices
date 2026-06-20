const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');

const generateUniqueCouponCode = async () => {
  const prefix = 'LOYAL';
  let code;
  let exists = true;
  while (exists) {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    code = `${prefix}-${randomPart}`;
    exists = await Coupon.exists({ code });
  }
  return code;
};

const getCompletedBookingsCount = async (userId) => {
  return Booking.countDocuments({ user: userId, status: 'completed' });
};

const getUserCouponStats = async (userId) => {
  const [unusedCount, usedCount] = await Promise.all([
    Coupon.countDocuments({ user: userId, status: 'unused' }),
    Coupon.countDocuments({ user: userId, status: 'used' }),
  ]);
  return { unusedCount, usedCount };
};

const generateLoyaltyCouponIfEligible = async (userId) => {
  const completedBookingsCount = await getCompletedBookingsCount(userId);
  const { unusedCount, usedCount } = await getUserCouponStats(userId);
  const threshold = (usedCount + 1) * 5;

  if (unusedCount > 0 || completedBookingsCount < threshold) {
    return null;
  }

  const code = await generateUniqueCouponCode();
  return Coupon.create({
    user: userId,
    code,
    discountPercent: 50,
  });
};

const validateCouponForUser = async (userId, couponCode) => {
  if (!couponCode || typeof couponCode !== 'string') {
    return null;
  }

  const code = couponCode.trim().toUpperCase();
  const coupon = await Coupon.findOne({ user: userId, code });
  if (!coupon || coupon.status !== 'unused') {
    return null;
  }

  return coupon;
};

const getUserCoupons = async (userId) => {
  return Coupon.find({ user: userId }).sort({ createdAt: -1 });
};

module.exports = {
  generateLoyaltyCouponIfEligible,
  validateCouponForUser,
  applyCouponToBookingData: (bookingData, coupon) => {
    bookingData.appliedCoupon = coupon.code;
    bookingData.isLoyaltyDiscount = true;
    bookingData.discountAmount = coupon.discountPercent;
    bookingData.originalAmount = bookingData.amount || 0;
  },
  getUserCoupons,
};
