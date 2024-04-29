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

// Display all transactions
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.session.userId }).sort({ date: -1 }); // Sort by date descending
        res.render('transactions', { transactions });
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

module.exports = router;
