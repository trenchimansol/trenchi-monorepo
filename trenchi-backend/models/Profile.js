// models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  walletAddress: { type: String },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Man', 'Woman'] },
  twitter: { type: String, required: true },
  tradingStyle: { type: String, required: true },
  location: { type: String, required: true },
  lookingFor: { type: String, required: true },
  favoriteCoin: { type: String, required: true },
  totalWalletValue: { type: String, required: true },
  totalTrenched: { type: String, default: 'Coming Soon' },
  
  // Updated to store an array of Base64 strings
  images: {
    type: [String],
    default: [],
  },
  
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  dislikedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  matchedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  referralCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
