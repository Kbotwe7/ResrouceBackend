const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const { query } = require('../db');

// Create new booking
router.post('/', auth, async (req, res) => {
  try {
    const { resourceId, startTime, endTime, purpose } = req.body;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if resource is available
    if (resource.status !== 'Available') {
      return res.status(400).json({ message: 'Resource is not available' });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      resource: resourceId,
      status: { $ne: 'Cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Create new booking
    const booking = new Booking({
      user: req.user._id,
      resource: resourceId,
      startTime,
      endTime,
      purpose
    });

    await booking.save();

    // Update resource status
    resource.status = 'Booked';
    await resource.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.findByUserId(req.user.id);
    res.json(bookings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all bookings (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const bookings = await Booking.findAll();
    res.json(bookings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get bookings by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await query(`
      SELECT b.*, r.name as resource_name, r.category
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      WHERE b.user_id = $1
      ORDER BY b.date DESC, b.time DESC
    `, [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user is admin or the booking owner
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is admin or the booking owner
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Booking.delete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update booking status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status } = req.body;
    const booking = await Booking.update(req.params.id, { status });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM bookings WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 