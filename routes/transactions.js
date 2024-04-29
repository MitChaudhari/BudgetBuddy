require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
}

// Display all transactions with optional filtering
router.get('/', isAuthenticated, async (req, res) => {
  try {
      let filteredQuery = { userId: req.session.userId };
      let excludeFilteredQuery = { userId: req.session.userId };

      // Construct filtered query based on provided category and/or date
      if (req.query.category) {
          filteredQuery.category = req.query.category;
      }
      if (req.query.date) {
          const date = new Date(req.query.date);
          filteredQuery.date = {
              $gte: new Date(date.setHours(0, 0, 0, 0)),
              $lt: new Date(date.setHours(23, 59, 59, 999)),
          };
      }

      // Find and sort filtered transactions
      const filteredTransactions = await Transaction.find(filteredQuery).sort({ date: -1 });

      // If filters are applied, adjust the exclude query to get the rest of the transactions
      if (req.query.category || req.query.date) {
          if (req.query.category) {
              excludeFilteredQuery.category = { $ne: req.query.category };
          }
          if (req.query.date) {
              excludeFilteredQuery.date = {
                  $not: {
                      $gte: new Date(filteredQuery.date.$gte),
                      $lt: new Date(filteredQuery.date.$lt),
                  },
              };
          }
          // Find and sort non-filtered transactions
          const nonFilteredTransactions = await Transaction.find(excludeFilteredQuery).sort({ date: -1 });

          // Combine filtered and non-filtered transactions, ensuring filtered ones are first
          transactions = filteredTransactions.concat(nonFilteredTransactions);
      } else {
          transactions = filteredTransactions; // If no filters, all transactions are considered filtered
      }

      res.render('transactions', { transactions, filter: req.query });
  } catch (error) {
      res.status(500).send('Server error');
  }
});


// Display form to add a new transaction
router.get('/add', isAuthenticated, (req, res) => {
    res.render('addTransaction');
});

// Handle form submission for adding a new transaction
router.post('/add', isAuthenticated, [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').not().isEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Date must be a valid date'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('addTransaction', { errors: errors.array() });
    }
    try {
        const newTransaction = new Transaction({
            ...req.body,
            userId: req.session.userId
        });
        await newTransaction.save();
        res.redirect('/transactions');  // Redirect back to the transactions page to see the new transaction
    } catch (error) {
        res.status(500).render('addTransaction', { message: 'Error adding transaction', error: error });
    }
});

// View Transaction Details
router.get('/:id/view', isAuthenticated, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);  // Send transaction data as JSON
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error });
  }
});

// Get Transaction for Editing
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }
    res.render('editTransaction', { transaction });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Post updates to a Transaction
router.post('/:id/edit', isAuthenticated, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').not().isEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Date must be a valid date'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('editTransaction', { transaction: req.body, errors: errors.array(), transactionId: req.params.id });
  }

  try {
    await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.redirect('/transactions');
  } catch (error) {
    res.status(500).render('editTransaction', { transaction: req.body, message: 'Error updating transaction', error });
  }
});

// Delete Transaction
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const result = await Transaction.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).send('Transaction not found');
    }
    res.redirect('/transactions'); // Redirect to the transactions list after deletion
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).send('Server error: ' + error.message);
  }
});



module.exports = router;
