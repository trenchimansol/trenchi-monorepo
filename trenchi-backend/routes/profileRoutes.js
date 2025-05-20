// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile'); // Ensure the path is correct

/**
 * GET /api/profile/:walletAddress
 * Checks if a profile exists for the provided wallet address.
 * The wallet address serves as the unique identifier (i.e., the login/password).
 */
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    const profile = await Profile.findOne({ walletAddress });
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
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
router.post('/profile', async (req, res) => {
  try {
    const newProfile = new Profile(req.body);
    await newProfile.save();
    res.status(200).json({ message: 'Profile saved successfully!' });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

module.exports = router;
