const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware - CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Book Distribution API is running!', endpoints: ['/api/books', '/api/centers', '/api/users'] });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Routes
const booksRouter = require('../backend/routes/books');
const centersRouter = require('../backend/routes/centers');
const usersRouter = require('../backend/routes/users');

app.use('/api/books', booksRouter);
app.use('/api/centers', centersRouter);
app.use('/api/users', usersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-distribution';

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = mongoose.connection;
    console.log('Connected to MongoDB');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Connect to database
  try {
    await connectToDatabase();
  } catch (error) {
    return res.status(500).json({ error: 'Database connection failed', message: error.message });
  }

  // Handle the request with Express
  return app(req, res);
};

