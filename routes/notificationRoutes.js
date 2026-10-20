const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authorize = require('../middlewares/authorize');
const { User } = require('../models/userModel');

router.use(authorize);

// Get my notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('role isAdmin');

    const query = {
      $or: [
        { recipient: userId }
      ]
    };

    if (user?.isAdmin || user?.role === 'admin') {
      query.$or.push({ recipientRole: 'admin' }, { recipientRole: 'all' });
    } else if (user?.role === 'provider') {
      query.$or.push({ recipientRole: 'provider', recipient: null });
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false
    });

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark one notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('role isAdmin');

    const query = {
      $or: [
        { recipient: userId }
      ]
    };

    if (user?.isAdmin || user?.role === 'admin') {
      query.$or.push({ recipientRole: 'admin' }, { recipientRole: 'all' });
    }

    await Notification.updateMany(query, { read: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
