// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * POST /api/register
 * Creates a new user if the wallet address does not already exist.
 */
router.post('/register', async (req, res) => {
  const { walletAddress, age, gender, portfolioValue } = req.body;
  try {
    // Check if user already exists by wallet address
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create and save new user
    const newUser = new User({
      walletAddress,
      age,
      gender,
      portfolioValue
    });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/login
 * Logs a user in by wallet address. If user not found, returns 404.
 * In a production environment, you'd likely implement a signature-based
 * challenge to verify wallet ownership.
 */
router.post('/login', async (req, res) => {
  const { walletAddress } = req.body;
  try {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // If using challenge–response, you'd verify signature here
    return res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/profile
 * Updates the user's profile fields (e.g., age, gender, portfolioValue).
 * The user is identified by walletAddress.
 */
router.put('/profile', async (req, res) => {
  const { walletAddress, age, gender, portfolioValue } = req.body;
  try {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Update fields if provided
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (portfolioValue !== undefined) user.portfolioValue = portfolioValue;
    
    await user.save();
    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
