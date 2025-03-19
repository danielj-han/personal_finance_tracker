const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  period: {
    type: String,
    enum: {
      values: ['weekly', 'monthly', 'quarterly', 'yearly'],
      message: '{VALUE} is not a valid period'
    },
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  color: {
    type: String,
    default: '#1976d2'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Budget', budgetSchema); 