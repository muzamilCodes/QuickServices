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
    { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Leak repair, tap fitting, blocked drains and bathroom plumbing', details: ['Leak repair', 'Tap fitting', 'Drain cleaning'], basePrice: 499, priceUnit: 'visit', rating: 4.8 },
    { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Switchboards, fans, lights, wiring faults and new installations', details: ['Fan fitting', 'Wiring faults', 'Switchboard repair'], basePrice: 499, priceUnit: 'visit', rating: 4.9 },
    { id: 'driver', name: 'Driver', icon: '🚗', description: 'Local trips, pickups, drops, hourly driving and event transport', details: ['Hourly driver', 'Pickup/drop', 'Outstation support'], basePrice: 399, priceUnit: 'hr', rating: 4.7 },
    { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Home, rental, office and deep cleaning visits', details: ['Home cleaning', 'Office cleaning', 'Deep cleaning'], basePrice: 399, priceUnit: 'visit', rating: 4.8 },
    { id: 'carpenter', name: 'Carpenter', icon: '🔨', description: 'Furniture fixes, wall mounts, shelves and fittings', details: ['Furniture repair', 'Wall mounts', 'Shelf fitting'], basePrice: 599, priceUnit: 'visit', rating: 4.7 },
    { id: 'painter', name: 'Painter', icon: '🎨', description: 'Touch-ups, feature walls and complete room refresh', details: ['Wall touch-up', 'Room painting', 'Patch repair'], basePrice: 699, priceUnit: 'visit', rating: 4.6 },
    { id: 'mechanic', name: 'Mechanic', icon: '🛠️', description: 'Basic car and bike diagnosis with doorstep support', details: ['Bike checkup', 'Car diagnosis', 'Minor fixes'], basePrice: 499, priceUnit: 'visit', rating: 4.6 },
    { id: 'gardener', name: 'Gardener', icon: '🌿', description: 'Pruning, watering, garden cleaning and seasonal upkeep', details: ['Pruning', 'Garden cleanup', 'Plant care'], basePrice: 399, priceUnit: 'visit', rating: 4.7 },
    { id: 'ac', name: 'AC Technician', icon: '❄️', description: 'AC repair, gas refill, installation and servicing', details: ['Gas refill', 'Wet service', 'Installation'], basePrice: 599, priceUnit: 'visit', rating: 4.9 },
    { id: 'tv', name: 'TV Repair', icon: '📺', description: 'LED, LCD, Smart TV fixing and installation', details: ['Panel diagnosis', 'Wall mount', 'Smart TV setup'], basePrice: 499, priceUnit: 'visit', rating: 4.6 },
    { id: 'laundry', name: 'Laundry', icon: '🧺', description: 'Clothes washing, ironing and dry cleaning service', details: ['Wash and fold', 'Ironing', 'Dry cleaning'], basePrice: 299, priceUnit: 'order', rating: 4.7 },
    { id: 'cook', name: 'Cook', icon: '🍳', description: 'Home cooking, event cooking and daily meal prep', details: ['Daily meals', 'Event cooking', 'Meal prep'], basePrice: 499, priceUnit: 'day', rating: 4.8 },
    { id: 'pet', name: 'Pet Care', icon: '🐶', description: 'Pet grooming, walking and basic care', details: ['Pet walk', 'Grooming', 'Feeding visit'], basePrice: 399, priceUnit: 'visit', rating: 4.7 },
    { id: 'locksmith', name: 'Locksmith', icon: '🔐', description: 'Door unlock, key duplication and lock repair', details: ['Door unlock', 'Duplicate key', 'Lock repair'], basePrice: 349, priceUnit: 'visit', rating: 4.6 },
    { id: 'computer', name: 'Computer Repair', icon: '💻', description: 'Laptop, PC repair and software issues', details: ['Laptop repair', 'Software issue', 'PC tune-up'], basePrice: 499, priceUnit: 'visit', rating: 4.7 },
    { id: 'wifi', name: 'WiFi Setup', icon: '📡', description: 'Router setup and internet troubleshooting', details: ['Router setup', 'Speed issue', 'Coverage check'], basePrice: 299, priceUnit: 'visit', rating: 4.6 },
    { id: 'delivery', name: 'Delivery Helper', icon: '📦', description: 'Local parcel pickup and delivery support', details: ['Parcel pickup', 'Document drop', 'Local delivery'], basePrice: 199, priceUnit: 'order', rating: 4.5 },
    { id: 'glass', name: 'Glass Repair', icon: '🪟', description: 'Window glass repair and replacement', details: ['Window repair', 'Glass replacement', 'Sealing'], basePrice: 449, priceUnit: 'visit', rating: 4.5 },
    { id: 'bathroom', name: 'Bathroom Cleaning', icon: '🚿', description: 'Deep bathroom cleaning and sanitization', details: ['Deep cleaning', 'Scale removal', 'Sanitization'], basePrice: 399, priceUnit: 'bathroom', rating: 4.8 },
    { id: 'sofa', name: 'Sofa Cleaning', icon: '🛋️', description: 'Sofa shampooing and stain removal', details: ['Shampooing', 'Vacuuming', 'Stain removal'], basePrice: 499, priceUnit: 'seat', rating: 4.7 },
    { id: 'kitchen', name: 'Kitchen Cleaning', icon: '🧼', description: 'Deep kitchen cleaning and oil removal', details: ['Oil removal', 'Tile cleaning', 'Sink cleanup'], basePrice: 599, priceUnit: 'kitchen', rating: 4.8 },
    { id: 'inspection', name: 'Home Inspection', icon: '🏠', description: 'Basic home maintenance inspection', details: ['Plumbing check', 'Electrical check', 'Safety report'], basePrice: 399, priceUnit: 'visit', rating: 4.6 },
    { id: 'inverter', name: 'Inverter Repair', icon: '🔋', description: 'Battery and inverter repair service', details: ['Battery check', 'Backup issue', 'Wiring check'], basePrice: 499, priceUnit: 'visit', rating: 4.6 },
    { id: 'tank', name: 'Water Tank Cleaning', icon: '🚰', description: 'Overhead tank cleaning and hygiene', details: ['Tank wash', 'Sludge removal', 'Disinfection'], basePrice: 599, priceUnit: 'tank', rating: 4.7 },
    { id: 'polish', name: 'Wood Polish', icon: '🪵', description: 'Furniture polishing and restoration', details: ['Furniture polish', 'Scratch touch-up', 'Restoration'], basePrice: 499, priceUnit: 'visit', rating: 4.6 },
    { id: 'appliance', name: 'Appliance Repair', icon: '🔧', description: 'Fridge, washing machine and mixer repair', details: ['Fridge repair', 'Washer repair', 'Mixer repair'], basePrice: 499, priceUnit: 'visit', rating: 4.7 },
    { id: 'door', name: 'Door Repair', icon: '🚪', description: 'Door hinges, locks and sliding repair', details: ['Hinge repair', 'Handle repair', 'Sliding fix'], basePrice: 399, priceUnit: 'visit', rating: 4.6 },
    { id: 'moving', name: 'Mover', icon: '🚚', description: 'House shifting and packing service', details: ['Packing', 'Loading', 'House shifting'], basePrice: 999, priceUnit: 'job', rating: 4.8 },
    { id: 'pest', name: 'Pest Control', icon: '🛡️', description: 'Cockroach, ant, mosquito, termite and general pest treatment', details: ['Cockroach control', 'Termite check', 'General spray'], basePrice: 799, priceUnit: 'visit', rating: 4.7 },
    { id: 'cctv', name: 'CCTV Setup', icon: '📹', description: 'Camera installation, DVR setup and mobile viewing', details: ['Camera install', 'DVR setup', 'Mobile view'], basePrice: 699, priceUnit: 'camera', rating: 4.6 },
    { id: 'salon', name: 'Salon at Home', icon: '💇', description: 'Haircut, grooming, facial, waxing and home salon appointments', details: ['Haircut', 'Facial', 'Grooming'], basePrice: 399, priceUnit: 'session', rating: 4.8 },
    { id: 'babysitter', name: 'Babysitter', icon: '🍼', description: 'Short-duration child care support for home, events and errands', details: ['Child care', 'Event support', 'Hourly help'], basePrice: 249, priceUnit: 'hr', rating: 4.6 },
    { id: 'eldercare', name: 'Elder Care', icon: '🩺', description: 'Companion visits, medicine reminders and basic non-medical support', details: ['Companion visit', 'Medicine reminder', 'Basic support'], basePrice: 299, priceUnit: 'hr', rating: 4.7 },
    { id: 'nurse', name: 'Nurse Visit', icon: '💉', description: 'Injection support, vitals check and basic home nursing visit', details: ['Vitals check', 'Injection support', 'Dressing help'], basePrice: 599, priceUnit: 'visit', rating: 4.8 },
    { id: 'tutor', name: 'Tutor', icon: '📚', description: 'Home tutoring for school subjects, homework and exam practice', details: ['Homework help', 'Exam practice', 'Subject tuition'], basePrice: 299, priceUnit: 'hr', rating: 4.7 },
    { id: 'carwash', name: 'Car Wash', icon: '🚘', description: 'Exterior wash, interior vacuum, polish and doorstep car cleaning', details: ['Exterior wash', 'Interior vacuum', 'Polish'], basePrice: 349, priceUnit: 'car', rating: 4.6 },
    { id: 'chimney', name: 'Chimney Cleaning', icon: '🔥', description: 'Kitchen chimney filter cleaning, oil removal and suction check', details: ['Filter cleaning', 'Oil removal', 'Suction check'], basePrice: 499, priceUnit: 'chimney', rating: 4.6 },
    { id: 'waterpurifier', name: 'Water Purifier', icon: '💧', description: 'RO service, filter change, leakage repair and water taste checks', details: ['RO service', 'Filter change', 'Leak repair'], basePrice: 449, priceUnit: 'visit', rating: 4.7 },
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
