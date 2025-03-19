const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Apply auth middleware
router.use(auth);

// Default categories
const defaultCategories = {
  Expense: [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Personal Care',
    'Insurance',
    'Debt Payments',
    'Savings',
    'Investments',
    'Gifts & Donations',
    'Travel',
    'Miscellaneous'
  ],
  Income: [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Rental Income',
    'Gifts Received',
    'Other Income'
  ]
};

// Get all categories
router.get('/', (req, res) => {
  res.json(defaultCategories);
});

module.exports = router; 