const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's bookings
    await Booking.deleteMany({ user: req.params.id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalResources: await Resource.countDocuments(),
      totalBookings: await Booking.countDocuments(),
      activeBookings: await Booking.countDocuments({ status: { $ne: 'Cancelled' } }),
      resourcesByCategory: await Resource.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      bookingsByStatus: await Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update system settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    // Here you can add system-wide settings
    // For example: booking duration limits, maintenance mode, etc.
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 