// routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

/**
 * GET /api/leaderboard
 * Returns the top users sorted by total points (matches + referrals)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { userWallet } = req.query;

    // Get total count of users and user's rank if wallet provided
    let userRank = null;
    if (userWallet) {
      const userProfile = await Profile.findOne({ walletAddress: userWallet });
      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }
      const betterRankedUsers = await Profile.countDocuments({
        totalPoints: { $gt: userProfile.totalPoints }
      });
      userRank = betterRankedUsers + 1;
    }

    // Get top 20 users
    const leaderboard = await Profile.find({})
      .select('name walletAddress matchCount referralCount totalPoints')
      .sort({ totalPoints: -1 })
      .limit(20);

    if (!leaderboard) {
      return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }

    // Format the leaderboard data
    const formattedLeaderboard = leaderboard.map(user => ({
      name: user.name || user.walletAddress.slice(0, 6),
      walletAddress: user.walletAddress,
      matchCount: user.matchCount || 0,
      referralCount: user.referralCount || 0,
      totalPoints: user.totalPoints || 0
    }));

    return res.status(200).json(formattedLeaderboard);


  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
