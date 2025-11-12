const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  costPaid: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
stockSchema.index({ center: 1, book: 1 });

module.exports = mongoose.model('Stock', stockSchema);
