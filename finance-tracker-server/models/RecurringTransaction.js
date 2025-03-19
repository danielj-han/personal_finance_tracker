const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],
    required: true
  },
  startDate: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid date string! Use YYYY-MM-DD format.`
    }
  },
  endDate: {
    type: Date
  },
  lastProcessed: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true }
});

// Add this pre-save middleware to log the document before saving
recurringTransactionSchema.pre('save', function(next) {
  console.log('Saving recurring transaction:', this);
  next();
});

// Add this to ensure dates are properly serialized
recurringTransactionSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.startDate) {
      ret.startDate = ret.startDate.split('T')[0];
    }
    return ret;
  }
});

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema); 