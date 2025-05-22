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
      .select('name walletAddress matchCount matchPoints referralCount referralPoints totalPoints')
      .sort({ totalPoints: -1 })
      .limit(20);

    if (!leaderboard) {
      return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }

    // Get user's data if not in top 20
    let userData = null;
    if (userWallet && userRank > 20) {
      userData = await Profile.findOne({ walletAddress: userWallet })
        .select('name walletAddress matchCount matchPoints referralCount referralPoints totalPoints');
      
      if (!userData) {
        return res.status(404).json({ error: 'User profile not found' });
      }
    }

    // Ensure all required fields are present
    const formattedLeaderboard = leaderboard.map(user => {
      if (!user.name || !user.walletAddress) {
        console.error('Invalid user data:', user);
        return null;
      }
      return {
      name: user.name,
      walletAddress: user.walletAddress,
      matchCount: user.matchCount,
      matchPoints: user.matchPoints,
      referralCount: user.referralCount,
      referralPoints: user.referralPoints,
      totalPoints: user.totalPoints || 0
    };
    }).filter(Boolean); // Remove any null entries

    if (!formattedLeaderboard || formattedLeaderboard.length === 0) {
      return res.status(500).json({ error: 'No valid leaderboard data available' });
    }

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
