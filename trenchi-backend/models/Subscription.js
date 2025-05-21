const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  transactionSignature: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    required: true,
    enum: ['Basic Premium', 'Extended Premium'],
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
