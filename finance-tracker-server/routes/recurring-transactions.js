const express = require('express');
const router = express.Router();
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { addDays, addWeeks, addMonths, isBefore } = require('date-fns');
const mongoose = require('mongoose');

router.use(auth);

// Process recurring transactions
const processRecurringTransactions = async () => {
  const recurringTransactions = await RecurringTransaction.find({});
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  for (const recurring of recurringTransactions) {
    let nextDate = recurring.lastProcessed || new Date(recurring.startDate);
    let nextDateString = nextDate.toISOString().split('T')[0];
    
    while (nextDateString <= todayString) {
      // Create transaction with the exact date string
      await Transaction.create({
        user: recurring.user,
        description: recurring.description,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        date: nextDateString // Use the exact date string for each transaction
      });

      // Calculate next date
      switch (recurring.frequency) {
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'bi-weekly':
          nextDate = addWeeks(nextDate, 2);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
      }
      nextDateString = nextDate.toISOString().split('T')[0];
    }

    // Update last processed date
    recurring.lastProcessed = today;
    await recurring.save();
  }
};

// Run this when server starts and periodically
setInterval(processRecurringTransactions, 24 * 60 * 60 * 1000); // Run daily
processRecurringTransactions();

// Get all recurring transactions
router.get('/', async (req, res) => {
  try {
    const recurringTransactions = await RecurringTransaction.find({ user: req.user._id });
    res.json(recurringTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new recurring transaction
router.post('/', async (req, res) => {
  try {
    const dateString = req.body.startDate; // YYYY-MM-DD format
    console.log('Received date string:', dateString);

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const recurringTransaction = new RecurringTransaction({
      ...req.body,
      startDate: dateString,
      user: req.user._id
    });
    
    const newRecurringTransaction = await recurringTransaction.save();

    // Compare dates as strings
    if (dateString <= todayString) {
      console.log('Creating immediate transaction with date:', dateString);
      await Transaction.create({
        user: req.user._id,
        description: req.body.description,
        amount: req.body.amount,
        type: req.body.type,
        category: req.body.category,
        date: dateString // Use the exact same date string from the recurring transaction
      });

      newRecurringTransaction.lastProcessed = today;
      await newRecurringTransaction.save();
    }

    res.status(201).json(newRecurringTransaction);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a recurring transaction
router.delete('/:id', async (req, res) => {
  try {
    console.log('Received delete request for ID:', req.params.id);
    console.log('User ID:', req.user._id);

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format');
      return res.status(400).json({ message: 'Invalid transaction ID format' });
    }

    // First find the transaction
    const recurringTransaction = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    console.log('Found transaction:', recurringTransaction);

    if (!recurringTransaction) {
      console.log('Transaction not found');
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    // Delete the transaction
    const deleteResult = await RecurringTransaction.deleteOne({
      _id: req.params.id,
      user: req.user._id
    });

    console.log('Delete result:', deleteResult);

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: 'Transaction could not be deleted' });
    }

    res.json({ 
      message: 'Recurring transaction deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting recurring transaction',
      error: error.message
    });
  }
});

// Update a recurring transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID format' });
    }

    const recurringTransaction = await RecurringTransaction.findOne({
      _id: id,
      user: req.user._id
    });

    if (!recurringTransaction) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    const updatedTransaction = await RecurringTransaction.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 