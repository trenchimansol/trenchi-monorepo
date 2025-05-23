const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// Create or update subscription
router.post('/', async (req, res) => {
  try {
    const { walletAddress, transactionSignature, plan, expirationDate } = req.body;

    // Find existing subscription or create new one
    let subscription = await Subscription.findOne({ walletAddress });
    
    if (subscription) {
      // Update existing subscription
      subscription.transactionSignature = transactionSignature;
      subscription.plan = plan;
      subscription.expirationDate = expirationDate;
      subscription.updatedAt = new Date();
    } else {
      // Create new subscription
      subscription = new Subscription({
        walletAddress,
        transactionSignature,
        plan,
        expirationDate,
      });
    }

    await subscription.save();
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({ error: 'Failed to create/update subscription' });
  }
});

// Get subscription status
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const subscription = await Subscription.findOne({ walletAddress });
    
    if (!subscription) {
      // Return a default response for non-subscribers
      return res.status(200).json({
        walletAddress,
        isExpired: true,
        plan: 'Free',
        expirationDate: null
      });
    }

    // Check if subscription is expired
    const isExpired = new Date() > new Date(subscription.expirationDate);
    
    res.status(200).json({
      ...subscription.toObject(),
      isExpired,
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

module.exports = router;
