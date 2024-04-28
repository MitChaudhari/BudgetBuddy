const mongoose = require('mongoose');
const User = require('./User'); // Ensure the User model is imported to create references

// Create a new schema for the budget data
const budgetSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required"]  // Ensures every budget is linked to a user
  },
  // Category of the budget, required and should align with transaction categories
  category: {
    type: String,
    required: [true, "Category is required"]
  },
  // Monetary limit for the budget category
  limit: {
    type: Number,
    required: [true, "Budget limit is required"]
  },
  // Period defining how often the budget resets, e.g., monthly, annually
  period: {
    type: String,
    required: [true, "Budget period is required"],
    enum: ['monthly', 'annually']  // Restrict the values to 'monthly' or 'annually'
  }
}, {
  timestamps: true  // Automatically add createdAt and updatedAt timestamps
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
