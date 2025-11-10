const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books (optionally filtered by type and/or language)
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.type) {
      query.type = req.query.type.toUpperCase();
    }
    if (req.query.language) {
      query.language = req.query.language;
    }
    const books = await Book.find(query).sort({ name: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new book
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const { name, price, point, type, language } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (name !== undefined) book.name = name;
    if (price !== undefined) book.price = price;
    if (point !== undefined) book.point = point;
    if (type !== undefined) book.type = type.toUpperCase();
    if (language !== undefined) book.language = language;

    await book.save();
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

