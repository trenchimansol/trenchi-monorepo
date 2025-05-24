const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { authenticateToken } = require('../middleware/auth');

// Get leaderboard data
router.get('/', async (req, res) => {
  try {
    // First get all profiles
    const profiles = await Profile.find({})
      .select('name walletAddress images matchedUsers matchCount matchPoints referralCount referralPoints initialPoints totalPoints')
      .limit(20);

    // Calculate points and sort
    const leaderboard = profiles.map(profile => {
      const initialPoints = profile.initialPoints || 10;
      const matchPoints = (profile.matchedUsers?.length || 0) * 2;
      const referralPoints = (profile.referralCount || 0) * 0.25;
      const calculatedPoints = initialPoints + matchPoints + referralPoints;
      return { ...profile.toObject(), calculatedPoints };
    }).sort((a, b) => b.calculatedPoints - a.calculatedPoints);

    if (!leaderboard || leaderboard.length === 0) {
      return res.status(200).json([]);
    }

    const formattedLeaderboard = leaderboard.map(profile => {
      return {
        name: profile.name || profile.walletAddress.slice(0, 6),
        walletAddress: profile.walletAddress,
        profileImage: profile.images?.[0] || '',
        matchCount: profile.matchedUsers?.length || 0,
        referralCount: profile.referralCount || 0,
        totalPoints: profile.calculatedPoints
      };
    });

    res.status(200).json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

module.exports = router;
