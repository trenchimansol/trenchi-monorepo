const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { authenticateToken } = require('../middleware/auth');

// Get leaderboard data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const leaderboard = await Profile.find({})
      .select('name walletAddress images matchedUsers referralCount')
      .sort({ referralCount: -1, matchedUsers: -1 })
      .limit(100);

    const formattedLeaderboard = leaderboard.map(profile => ({
      name: profile.name,
      walletAddress: profile.walletAddress,
      profileImage: profile.images[0] || '', // Get first image as profile picture
      matchCount: profile.matchedUsers.length,
      referralCount: profile.referralCount
    }));

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

module.exports = router;
