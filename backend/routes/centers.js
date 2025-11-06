const express = require('express');
const router = express.Router();
const Center = require('../models/Center');

// Get all centers
router.get('/', async (req, res) => {
  try {
    const centers = await Center.find().sort({ name: 1 });
    res.json(centers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new center
router.post('/', async (req, res) => {
  try {
    const center = new Center(req.body);
    await center.save();
    res.status(201).json(center);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get center by ID
router.get('/:id', async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }
    res.json(center);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get center analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const User = require('../models/User');
    const Book = require('../models/Book');
    
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    const users = await User.find({ center: req.params.id }).populate('distributions.book');
    const books = await Book.find();
    
    // Calculate book-wise analytics
    const bookAnalytics = {};
    
    users.forEach(user => {
      user.distributions.forEach(dist => {
        if (dist.book) {
          const bookId = dist.book._id.toString();
          if (!bookAnalytics[bookId]) {
            bookAnalytics[bookId] = {
              book: dist.book,
              count: 0,
              totalPrice: 0,
              totalPoints: 0,
              totalDonation: 0
            };
          }
          bookAnalytics[bookId].count += 1;
          bookAnalytics[bookId].totalPrice += dist.pricePaid;
          bookAnalytics[bookId].totalPoints += dist.book.point;
          
          const donation = dist.pricePaid - dist.book.price;
          if (donation > 0) {
            bookAnalytics[bookId].totalDonation += donation;
          }
        }
      });
    });

    const analytics = {
      center,
      bookAnalytics: Object.values(bookAnalytics),
      totalUsers: users.length
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

