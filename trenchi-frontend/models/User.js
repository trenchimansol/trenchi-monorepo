// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  age: Number,
  gender: String,
  portfolioValue: Number,
  // Add more fields as needed
});

module.exports = mongoose.model('User', userSchema);
