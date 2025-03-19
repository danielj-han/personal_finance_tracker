const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// Apply auth middleware to all routes
router.use(auth);

// Get all transactions for the logged-in user
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new transaction
router.post('/', async (req, res) => {
  console.log('Received POST request to /api/transactions');
  console.log('Request body:', req.body);
  
  try {
    const transaction = new Transaction({
      description: req.body.description,
      amount: Number(req.body.amount), // Ensure amount is a number
      type: req.body.type,
      category: req.body.category,
      user: req.user._id // Use the authenticated user's ID
    });

    console.log('Created transaction object:', transaction);

    const newTransaction = await transaction.save();
    console.log('Transaction saved successfully:', newTransaction);
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error('Error saving transaction:', err);
    // Send more detailed error message
    res.status(400).json({ 
      message: 'Transaction validation failed',
      error: err.message,
      details: err.errors
    });
  }
});

// Delete transaction (only if it belongs to the user)
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this route to your existing transactions routes
router.get('/export/pdf', auth, async (req, res) => {
  console.log('PDF export route hit');
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    console.log(`Found ${transactions.length} transactions`);
    
    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    
    // Pipe the PDF document to the response
    doc.pipe(res);
    
    // Add title with slightly smaller font
    doc.fontSize(16).text('Transaction Report', { align: 'center' });
    doc.moveDown();
    
    // Add table headers with smaller font
    doc.fontSize(10);
    doc.text('Date', 40, 100);
    doc.text('Description', 120, 100);
    doc.text('Amount', 220, 100);
    doc.text('Type', 280, 100);
    doc.text('Category', 340, 100);
    
    // Draw a line under headers
    doc.moveTo(40, 115).lineTo(500, 115).stroke();
    
    let y = 125;
    const lineHeight = 15;
    
    // Add transactions with smaller font
    doc.fontSize(9);
    transactions.forEach(transaction => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      
      const date = new Date(transaction.date).toLocaleDateString();
      doc.text(date, 40, y, { width: 70 });
      doc.text(transaction.description, 120, y, { width: 90 });
      doc.text(`$${transaction.amount.toFixed(2)}`, 220, y, { width: 50 });
      doc.text(transaction.type, 280, y, { width: 50 });
      doc.text(transaction.category, 340, y, { width: 90 });
      
      y += lineHeight;
    });
    
    // Add summary with slightly larger font
    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const balance = income - expenses;
    
    doc.moveDown(2);
    doc.fontSize(11);
    doc.text(`Total Income: $${income.toFixed(2)}`, { align: 'right' });
    doc.text(`Total Expenses: $${expenses.toFixed(2)}`, { align: 'right' });
    doc.text(`Balance: $${balance.toFixed(2)}`, { align: 'right' });
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

module.exports = router; 