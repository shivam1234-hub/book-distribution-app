const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  donation: {
    type: Number,
    default: 0
  },
  loss: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Center', centerSchema);

