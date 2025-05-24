const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { authenticateToken } = require('../middleware/auth');

// Get leaderboard data
router.get('/', async (req, res) => {
  try {
    const leaderboard = await Profile.find({})
      .select('name walletAddress images matchedUsers matchCount matchPoints referralCount referralPoints initialPoints totalPoints')
      .sort({ totalPoints: -1 })
      .limit(20);

    if (!leaderboard || leaderboard.length === 0) {
      return res.status(200).json([]);
    }

    const formattedLeaderboard = leaderboard.map(profile => ({
      name: profile.name || profile.walletAddress.slice(0, 6),
      walletAddress: profile.walletAddress,
      profileImage: profile.images?.[0] || '',
      matchCount: profile.matchedUsers?.length || 0,
      referralCount: profile.referralCount || 0,
      totalPoints: profile.totalPoints || (profile.initialPoints + profile.matchPoints + profile.referralPoints) || 0
    }));

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

module.exports = router;
