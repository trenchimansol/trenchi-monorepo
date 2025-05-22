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
      const betterRankedUsers = await Profile.countDocuments({
        totalPoints: { $gt: (await Profile.findOne({ walletAddress: userWallet }))?.totalPoints || 0 }
      });
      userRank = betterRankedUsers + 1;
    }

    // Get top 20 users
    const leaderboard = await Profile.find({})
      .select('name walletAddress matchCount matchPoints referralCount referralPoints totalPoints')
      .sort({ totalPoints: -1 })
      .limit(20);

    // Get user's data if not in top 20
    let userData = null;
    if (userWallet && userRank > 20) {
      userData = await Profile.findOne({ walletAddress: userWallet })
        .select('name walletAddress matchCount matchPoints referralCount referralPoints totalPoints');
    }

    const formattedLeaderboard = leaderboard.map(user => ({
      name: user.name,
      walletAddress: user.walletAddress,
      matchCount: user.matchCount,
      matchPoints: user.matchPoints,
      referralCount: user.referralCount,
      referralPoints: user.referralPoints,
      totalPoints: user.totalPoints
    }));

    res.status(200).json({
      leaderboard: formattedLeaderboard,
      userRank,
      userData: userData ? {
        name: userData.name,
        walletAddress: userData.walletAddress,
        matchCount: userData.matchCount,
        matchPoints: userData.matchPoints,
        referralCount: userData.referralCount,
        referralPoints: userData.referralPoints,
        totalPoints: userData.totalPoints
      } : null
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
