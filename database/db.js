require('dotenv').config();
const mongoose = require('mongoose');

// Construct the MongoDB URI with the username and password from the .env file
const uri = process.env.DB_URI
  .replace('<username>', encodeURIComponent(process.env.DB_USERNAME))
  .replace('<password>', encodeURIComponent(process.env.DB_PASSWORD));

async function connect() {
  try {
    // Connect to MongoDB using Mongoose without deprecated options
    await mongoose.connect(uri);
    console.log("Connected successfully to MongoDB Atlas with Mongoose");
  } catch (e) {
    console.error("Could not connect to MongoDB Atlas with Mongoose", e);
    process.exit(1);
  }
}

module.exports = { connect };
