const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const { User } = require('../models/userModel');
const sendEmail = require('../utilities/emailService');
const WhatsAppService = require('../services/whatsappService');

const bookingOTPs = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      serviceType,
      customerName,
      customerPhone,
      address,
      description,
      preferredDate,
      preferredTime,
      isEmergency = false,
    } = req.body;

    if (!serviceType || !customerName || !customerPhone || !address?.fullAddress || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findById(userId).select('email username');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    bookingOTPs.set(userId, {
      otp,
      expiry: Date.now() + 10 * 60 * 1000,
      bookingData: {
        serviceType,
        customerName,
        customerPhone,
        address,
        description,
        preferredDate,
        preferredTime,
        isEmergency,
      },
    });

    try {
      await sendEmail(
        user.email,
        'Your Booking OTP',
        `
          <h2>Hello ${user.username || customerName},</h2>
          <p>Your booking OTP is <strong>${otp}</strong>.</p>
          <p>This OTP is valid for 10 minutes.</p>
          <p>Service: <strong>${serviceType}</strong></p>
          <p><strong>If the email is not in your inbox, please check Spam or Junk.</strong></p>
        `,
      );
    } catch (emailError) {
      console.error('Booking OTP email failed:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Unable to send booking OTP email right now. Please try again.',
      });
    }

    console.log(`Booking OTP sent to ${user.email}: ${otp}`);

    return res.json({
      success: true,
      message: 'OTP sent to your email. Please verify to confirm booking.',
      requiresOTP: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyBookingOTP = async (req, res) => {
  try {
    const userId = req.userId;
    const { otp, bookingMode = 'system' } = req.body;

    const otpData = bookingOTPs.get(userId);
    if (!otpData) {
      return res.status(400).json({ success: false, message: 'No pending booking found.' });
    }
    if (Date.now() > otpData.expiry) {
      bookingOTPs.delete(userId);
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }
    if (otpData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    const bookingData = otpData.bookingData;

    const newBooking = new Booking({
      user: userId,
      serviceType: bookingData.serviceType,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      address: bookingData.address,
      description: bookingData.description,
      preferredDate: bookingData.preferredDate,
      preferredTime: bookingData.preferredTime,
      isEmergency: bookingData.isEmergency,
      bookingMode,
      otpVerified: true,
      status: 'pending',
    });

    await newBooking.save();
    bookingOTPs.delete(userId);

    if (bookingMode === 'whatsapp') {
      const providers = await Provider.find({
        services: bookingData.serviceType,
        isAvailable: true,
        isApproved: true,
      });

      if (providers.length > 0) {
        const message = WhatsAppService.generateBookingMessage(bookingData);
        const whatsappLink = WhatsAppService.generateWhatsAppLink(providers[0].whatsappNumber, message);
        return res.json({
          success: true,
          message: 'Booking confirmed!',
          booking: newBooking,
          whatsappLink,
          redirectToWhatsApp: true,
        });
      }
    }

    return res.json({ success: true, message: 'Booking confirmed!', booking: newBooking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, user: req.userId });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getServices = async (req, res) => {
  const services = [
    { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Pipe repair & installation', basePrice: 499 },
    { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring & repairs', basePrice: 499 },
    { id: 'driver', name: 'Driver', icon: '🚗', description: 'Professional driving', basePrice: 399 },
    { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Home & office cleaning', basePrice: 399 },
    { id: 'carpenter', name: 'Carpenter', icon: '🔨', description: 'Furniture repair', basePrice: 599 },
    { id: 'painter', name: 'Painter', icon: '🎨', description: 'Wall painting', basePrice: 699 },
  ];

  return res.json({ success: true, services });
};

module.exports = {
  createBooking,
  verifyBookingOTP,
  getMyBookings,
  cancelBooking,
  getServices,
};
