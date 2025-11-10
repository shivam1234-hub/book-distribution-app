const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['MB', 'B', 'M', 'S', 'SB', 'CC'],
    uppercase: true
  },
  language: {
    type: String,
    required: true,
    enum: ['Hindi', 'English', 'Telugu', 'Kannada', 'Tamil', 'Bengali', 'Oriya', 'Marathi']
  },
  point: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);

