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
  // Points & Leaderboard System
  initialPoints: { type: Number, default: 10 }, // Points for creating profile
  matchCount: { type: Number, default: 0 },
  matchPoints: { type: Number, default: 0 }, // 2 points per match
  referralCount: { type: Number, default: 0 },
  referralPoints: { type: Number, default: 0 }, // 0.25 points per referral
  totalPoints: { type: Number, default: 10 }, // Combined points for leaderboard (starts with initial points)
  
  // Referral System
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
  referralHistory: [{
    walletAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
