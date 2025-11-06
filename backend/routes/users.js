const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const Center = require('../models/Center');

// Search users by center
router.get('/search', async (req, res) => {
  try {
    const { centerId, query } = req.query;
    
    if (!centerId) {
      return res.status(400).json({ error: 'Center ID is required' });
    }

    const searchQuery = {
      center: centerId
    };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { number: { $regex: query, $options: 'i' } }
      ];
    }

    const users = await User.find(searchQuery).sort({ name: 1 }).limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('distributions.book').populate('center');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get user
router.post('/', async (req, res) => {
  try {
    const { name, number, centerId } = req.body;

    if (!name || !number || !centerId) {
      return res.status(400).json({ error: 'Name, number, and centerId are required' });
    }

    // Check if user already exists in this center
    let user = await User.findOne({ number, center: centerId });

    if (!user) {
      // Create new user
      user = new User({
        name,
        number,
        center: centerId
      });
      await user.save();
    }

    await user.populate('center');
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add book distribution
router.post('/:id/distribution', async (req, res) => {
  try {
    const { bookId, pricePaid } = req.body;

    if (!bookId || pricePaid === undefined) {
      return res.status(400).json({ error: 'Book ID and price paid are required' });
    }

    const user = await User.findById(req.params.id);
    const book = await Book.findById(bookId);
    const center = await Center.findById(user.center);

    if (!user || !book || !center) {
      return res.status(404).json({ error: 'User, book, or center not found' });
    }

    // Calculate donation and loss
    const donation = pricePaid > book.price ? pricePaid - book.price : 0;
    const loss = pricePaid < book.price ? book.price - pricePaid : 0;

    // Add distribution
    user.distributions.push({
      book: bookId,
      pricePaid
    });

    // Update user points, donation, and loss
    user.points += book.point;
    user.totalDonation += donation;
    user.totalLoss += loss;

    // Update center points, donation, and loss
    center.points += book.point;
    center.donation += donation;
    center.loss += loss;

    await user.save();
    await center.save();

    await user.populate('distributions.book');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('distributions.book');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate book-wise distribution
    const bookDistribution = {};
    
    user.distributions.forEach(dist => {
      if (dist.book) {
        const bookId = dist.book._id.toString();
        if (!bookDistribution[bookId]) {
          bookDistribution[bookId] = {
            book: dist.book,
            count: 0
          };
        }
        bookDistribution[bookId].count += 1;
      }
    });

    const analytics = {
      user: {
        name: user.name,
        number: user.number,
        points: user.points,
        totalDonation: user.totalDonation,
        totalLoss: user.totalLoss
      },
      bookDistribution: Object.values(bookDistribution),
      totalDistributions: user.distributions.length
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

