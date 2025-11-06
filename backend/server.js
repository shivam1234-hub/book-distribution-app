const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware - CORS must be first, use simple configuration
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
const booksRouter = require('./routes/books');
const centersRouter = require('./routes/centers');
const usersRouter = require('./routes/users');

app.use('/api/books', booksRouter);
app.use('/api/centers', centersRouter);
app.use('/api/users', usersRouter);

// 404 handler for debugging
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-distribution';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

const PORT = process.env.PORT || 8083;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

