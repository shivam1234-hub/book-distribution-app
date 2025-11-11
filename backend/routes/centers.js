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

// Get all centers with their analytics (must be before /:id route)
router.get('/admin/all-analytics', async (req, res) => {
  try {
    const User = require('../models/User');
    const centers = await Center.find().sort({ name: 1 });
    
    const centersWithStats = await Promise.all(
      centers.map(async (center) => {
        const users = await User.find({ center: center._id });
        return {
          _id: center._id,
          name: center.name,
          points: center.points,
          donation: center.donation,
          loss: center.loss,
          totalUsers: users.length
        };
      })
    );

    res.json(centersWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get center analytics (must be before /:id route)
router.get('/:id/analytics', async (req, res) => {
  try {
    const User = require('../models/User');
    const Book = require('../models/Book');
    
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    const users = await User.find({ center: req.params.id }).populate('distributions.book');
    
    // Calculate type-wise analytics
    const typeAnalytics = {};
    
    users.forEach(user => {
      user.distributions.forEach(dist => {
        if (dist.book && dist.book.type) {
          const bookType = dist.book.type;
          if (!typeAnalytics[bookType]) {
            typeAnalytics[bookType] = {
              type: bookType,
              count: 0,
              totalPrice: 0,
              totalPoints: 0,
              totalDonation: 0
            };
          }
          typeAnalytics[bookType].count += 1;
          typeAnalytics[bookType].totalPrice += dist.pricePaid;
          typeAnalytics[bookType].totalPoints += dist.book.point;
          
          const donation = dist.pricePaid - dist.book.price;
          if (donation > 0) {
            typeAnalytics[bookType].totalDonation += donation;
          }
        }
      });
    });

    const analytics = {
      center,
      typeAnalytics: Object.values(typeAnalytics),
      totalUsers: users.length
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily analytics for a center (must be before /:id route)
router.get('/:id/daily-analytics', async (req, res) => {
  try {
    const User = require('../models/User');
    const Book = require('../models/Book');
    
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    // Get today's start and end times
    // Use date from query if provided, otherwise use server's local date
    let today;
    if (req.query.date) {
      // Parse date from query (format: YYYY-MM-DD) - interpret as local time
      const [year, month, day] = req.query.date.split('-').map(Number);
      today = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      today = new Date();
      today.setHours(0, 0, 0, 0);
    }
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const users = await User.find({ center: req.params.id }).populate('distributions.book');
    
    // Filter distributions for today
    let totalPoints = 0;
    let totalDonation = 0;
    let totalLoss = 0;
    const typeDistribution = {};
    const userDistributionCount = {};

    users.forEach(user => {
      let userPoints = 0;
      let userDistributions = 0;
      
      user.distributions.forEach(dist => {
        const distDate = new Date(dist.date);
        if (distDate >= today && distDate < tomorrow && dist.book && dist.book.type) {
          // Count type distributions
          const bookType = dist.book.type;
          if (!typeDistribution[bookType]) {
            typeDistribution[bookType] = {
              type: bookType,
              count: 0,
              totalPoints: 0,
              totalPrice: 0
            };
          }
          typeDistribution[bookType].count += 1;
          typeDistribution[bookType].totalPoints += dist.book.point;
          typeDistribution[bookType].totalPrice += dist.pricePaid;

          // Calculate points, donation, and loss
          totalPoints += dist.book.point;
          userPoints += dist.book.point;
          userDistributions += 1;

          const donation = dist.pricePaid > dist.book.price ? dist.pricePaid - dist.book.price : 0;
          const loss = dist.pricePaid < dist.book.price ? dist.book.price - dist.pricePaid : 0;
          
          totalDonation += donation;
          totalLoss += loss;
        }
      });

      // Track user distribution count for top 3
      if (userDistributions > 0) {
        userDistributionCount[user._id.toString()] = {
          user: {
            _id: user._id,
            name: user.name,
            number: user.number
          },
          count: userDistributions,
          points: userPoints
        };
      }
    });

    // Get top 3 devotees
    const topDevotees = Object.values(userDistributionCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Format date for response (use requested date or today's date)
    const dateStr = req.query.date || today.toISOString().split('T')[0];
    
    const analytics = {
      center: {
        _id: center._id,
        name: center.name
      },
      date: dateStr,
      totalPoints,
      totalDonation,
      totalLoss,
      typeDistribution: Object.values(typeDistribution),
      topDevotees
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get center by ID (must be after all specific routes)
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

// Update a center
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const center = await Center.findById(req.params.id);
    
    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    if (name !== undefined) center.name = name;

    await center.save();
    res.json(center);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

