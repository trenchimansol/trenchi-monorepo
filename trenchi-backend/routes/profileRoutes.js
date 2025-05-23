// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile'); // Ensure the path is correct

/**
 * GET /api/profile/:walletAddress
 * Checks if a profile exists for the provided wallet address.
 * The wallet address serves as the unique identifier (i.e., the login/password).
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    const profile = await Profile.findOne({ walletAddress });
    if (profile) {
      res.status(200).json(profile);
    } else {
      // For new accounts, return 200 with empty profile and default values
      res.status(200).json({
        walletAddress,
        isNewUser: true,
        totalPoints: 0,
        referralCount: 0,
        referralPoints: 0,
        cryptoInterests: 'Trading Memes',
        favoriteBlockchainNetworks: 'Solana'
      });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/profile
 * Creates a new profile.
 * req.body should include all required fields (including the walletAddress).
 */
// Generate a unique referral code
const generateReferralCode = async (walletAddress) => {
  // Take first 6 characters of wallet address and add random numbers
  const prefix = walletAddress.slice(2, 8).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const code = `${prefix}${random}`;
  
  // Check if code exists
  const existing = await Profile.findOne({ referralCode: code });
  if (existing) {
    // Try again with different random numbers
    return generateReferralCode(walletAddress);
  }
  return code;
};

router.post('/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    const { referredBy, ...profileData } = req.body;
    profileData.walletAddress = walletAddress; // Ensure walletAddress is set from params

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ walletAddress });
    if (existingProfile) {
      // If profile exists, update it
      const updatedProfile = await Profile.findOneAndUpdate(
        { walletAddress },
        { ...profileData },
        { new: true, runValidators: true }
      );
      return res.status(200).json(updatedProfile);
    }

    // Validate referral code if provided
    if (referredBy) {
      // Check if referral code exists
      const referrer = await Profile.findOne({ referralCode: referredBy });
      if (!referrer) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
      
      // Check if wallet is trying to refer itself
      if (referrer.walletAddress === walletAddress) {
        return res.status(400).json({ error: 'Cannot refer yourself' });
      }

      // Update referrer's points and history
      await Profile.findByIdAndUpdate(referrer._id, { 
        $inc: { 
          referralCount: 1,
          referralPoints: 0.25,
          totalPoints: 0.25
        },
        $push: { 
          referralHistory: {
            walletAddress,
            timestamp: new Date()
          }
        }
      });
    }

    // Generate unique referral code
    const referralCode = await generateReferralCode(walletAddress);
    
    // Create new profile with initial points
    const newProfile = new Profile({
      ...profileData,
      referralCode,
      initialPoints: 10,
      totalPoints: 10 // Start with signup bonus
    });
    
    const savedProfile = await newProfile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    console.error('Error saving profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Missing required fields', details: error.message });
    }
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

/**
 * DELETE /api/profile/:walletAddress
 * Deletes a user's profile and all associated data
 */
router.delete('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Find and delete the profile
    const profile = await Profile.findOneAndDelete({ walletAddress });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Remove this user's referral from other users' referral histories
    await Profile.updateMany(
      { 'referralHistory.walletAddress': walletAddress },
      { 
        $pull: { referralHistory: { walletAddress } },
        $inc: { referralCount: -1, referralPoints: -0.25, totalPoints: -0.25 }
      }
    );

    // Remove this user from others' matches, likes, and dislikes
    await Profile.updateMany(
      { $or: [
        { matchedUsers: profile._id },
        { likedUsers: profile._id },
        { dislikedUsers: profile._id }
      ]},
      { 
        $pull: { 
          matchedUsers: profile._id,
          likedUsers: profile._id,
          dislikedUsers: profile._id
        }
      }
    );

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

module.exports = router;
