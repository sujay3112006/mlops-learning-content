const mongoose = require('mongoose');

const salesDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  campaign: {
    type: String,
    required: true
  },
  revenue: {
    type: Number,
    required: true
  },
  leads: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SalesData', salesDataSchema);
