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
    const leaderboard = await Profile.find({})
      .select('name walletAddress matchCount matchPoints referralCount referralPoints totalPoints')
      .sort({ totalPoints: -1 })
      .limit(100);

    const formattedLeaderboard = leaderboard.map(user => ({
      name: user.name,
      walletAddress: user.walletAddress,
      stats: {
        matches: {
          count: user.matchCount,
          points: user.matchPoints
        },
        referrals: {
          count: user.referralCount,
          points: user.referralPoints
        },
        totalPoints: user.totalPoints
      }
    }));

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
