const mongoose = require('mongoose');
const User = require('./User');

// Create a new schema for the transaction data
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, "User ID is required"] // Ensures every transaction is linked to a user
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"]
  },
  category: {
    type: String,
    required: [true, "Category is required"]
  },
date: {
    type: Date,
    required: [true, "Date of transaction is required"]
  },
  description: {
    type: String
  }
}, {
  timestamps: true 
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
