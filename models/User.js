const mongoose = require('mongoose');

// Create a new schema for user data
const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, "First name is required"] 
  },
  lastName: { 
    type: String, 
    required: [true, "Last name is required"] 
  },
  // Define the email address which is unique and required
  emailAddress: { 
    type: String, 
    required: [true, "Email address is required"],
    unique: true, 
    match: [/.+\@.+\..+/, "Please fill a valid email address"] 
  },
  // Username that is unique and required
  username: { 
    type: String, 
    required: [true, "Username is required"],
    unique: true
  },
  // Password that is required
  password: { 
    type: String, 
    required: [true, "Password is required"]
  }
}, {
  timestamps: true 
});

// Create a model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User; 
