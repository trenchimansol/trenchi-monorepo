// models/Profile.js
const mongoose = require('mongoose');

const CRYPTO_INTERESTS = [
  'Trading Memes',
  'Learning Crypto',
  'Finding Web3 Love',
  'Just for Fun'
];

const BLOCKCHAIN_NETWORKS = [
  'Solana',
  'Bitcoin',
  'Ethereum',
  'Binance',
  'Other'
];

const profileSchema = new mongoose.Schema({
  walletAddress: { type: String },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Man', 'Woman'] },
  bio: { type: String, required: true },
  seeking: { type: String, required: true, enum: ['Man', 'Woman'] },
  twitter: { type: String },
  tradingStyle: { type: String },
  location: { type: String },
  lookingFor: { type: String },
  favoriteCoin: { type: String },
  totalWalletValue: { type: String },
  totalTrenched: { type: String, default: 'Coming Soon' },
  cryptoInterests: { type: String, enum: CRYPTO_INTERESTS, default: CRYPTO_INTERESTS[0] },
  favoriteBlockchainNetworks: { type: String, enum: BLOCKCHAIN_NETWORKS, default: BLOCKCHAIN_NETWORKS[0] },
  
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
