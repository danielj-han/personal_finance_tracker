const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Apply auth middleware to all routes
router.use(auth);

// Get all budgets for the user
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new budget
router.post('/', async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      user: req.user._id
    });

    // Validate the budget before saving
    const validationError = budget.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        message: Object.values(validationError.errors)[0].message 
      });
    }

    const newBudget = await budget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Budget creation error:', error);
    res.status(400).json({ 
      message: error.message || 'Error creating budget'
    });
  }
});

// Update a budget
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid budget ID format' });
    }

    const budget = await Budget.findOne({
      _id: id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get budget progress
router.get('/progress/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const transactions = await Transaction.find({
      user: req.user._id,
      category: budget.category,
      // Add date filtering based on budget period
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const progress = (totalSpent / budget.amount) * 100;

    res.json({
      budget,
      progress,
      totalSpent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 