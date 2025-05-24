// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

/**
 * GET /api/potential-matches?userId=<someUserId>
 * Returns an array of new profiles for the current user to swipe on,
 * excluding themselves and any they've already liked/disliked/matched.
 */
router.get('/potential/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ error: 'No wallet address provided' });
    }

    // Find current user's profile
    const currentUser = await Profile.findOne({ walletAddress });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // Build an array of IDs to exclude: the user themself plus liked, disliked, matched
    const excludeIds = [
      currentUser._id,
      ...currentUser.likedUsers,
      ...currentUser.dislikedUsers,
      ...currentUser.matchedUsers
    ];

    // Filter by gender preference
    const potential = await Profile.find({
      _id: { $nin: excludeIds },
      // Show only profiles that match the user's seeking preference AND who are seeking the user's gender
      $and: [
        { gender: currentUser.seeking }, // Their gender matches what we're seeking
        { seeking: currentUser.gender }  // They are seeking our gender
      ]
    });

    res.status(200).json(potential);
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    res.status(500).json({ error: 'Failed to fetch potential matches' });
  }
});

/**
 * GET /api/matches?userId=<someUserId>
 * Returns an array of matched users for the current user.
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ error: 'No wallet address provided' });
    }

    const currentUser = await Profile.findOne({ walletAddress });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // Retrieve matched profiles by their _id
    const matchedUserIds = currentUser.matchedUsers || [];
    const matchedProfiles = await Profile.find({ _id: { $in: matchedUserIds } });

    res.status(200).json(matchedProfiles);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

/**
 * POST /api/like/:id
 * Current user likes the user with ID :id.
 * If the other user has also liked the current user, a mutual match is formed.
 */
router.post('/like/:walletAddress', async (req, res) => {
  try {
    const { currentWalletAddress } = req.body;
    const { walletAddress: likedWalletAddress } = req.params;

    if (!currentWalletAddress) {
      return res.status(400).json({ error: 'No current wallet address provided' });
    }

    const currentUser = await Profile.findOne({ walletAddress: currentWalletAddress });
    const likedUser = await Profile.findOne({ walletAddress: likedWalletAddress });

    if (!currentUser || !likedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent duplicate likes
    if (currentUser.likedUsers.includes(likedUser._id)) {
      return res.status(400).json({ error: 'You have already liked this user.' });
    }

    // Add likedUser._id to currentUser's likedUsers array
    currentUser.likedUsers.push(likedUser._id);

    // Remove from dislikedUsers if present
    currentUser.dislikedUsers = currentUser.dislikedUsers.filter(
      id => id.toString() !== likedUser._id.toString()
    );

    let isMatch = false;

    // Check if this creates a mutual match
    if (likedUser.likedUsers.includes(currentUser._id)) {
      // Add to matched users if not already matched
      if (!currentUser.matchedUsers.includes(likedUser._id)) {
        currentUser.matchedUsers.push(likedUser._id);
      }
      if (!likedUser.matchedUsers.includes(currentUser._id)) {
        likedUser.matchedUsers.push(currentUser._id);
      }

      // Remove from likedUsers since they're now matched
      currentUser.likedUsers = currentUser.likedUsers.filter(
        id => id.toString() !== likedUser._id.toString()
      );
      likedUser.likedUsers = likedUser.likedUsers.filter(
        id => id.toString() !== currentUser._id.toString()
      );

      // Update match counts and points for both users
      currentUser.matchCount += 1;
      currentUser.matchPoints += 2;
      currentUser.totalPoints = currentUser.initialPoints + currentUser.matchPoints + currentUser.referralPoints;
      
      likedUser.matchCount += 1;
      likedUser.matchPoints += 2;
      likedUser.totalPoints = likedUser.initialPoints + likedUser.matchPoints + likedUser.referralPoints;

      isMatch = true;
    }

    await currentUser.save();
    await likedUser.save();

    res.status(200).json({ message: 'Like recorded', isMatch });
  } catch (error) {
    console.error('Error liking user:', error);
    res.status(500).json({ error: 'Failed to like user' });
  }
});

/**
 * POST /api/dislike/:id
 * Current user dislikes the user with ID :id.
 */
router.post('/dislike/:walletAddress', async (req, res) => {
  try {
    const { currentWalletAddress } = req.body;
    const { walletAddress: dislikedWalletAddress } = req.params;

    if (!currentWalletAddress) {
      return res.status(400).json({ error: 'No current wallet address provided' });
    }

    const currentUser = await Profile.findOne({ walletAddress: currentWalletAddress });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    const dislikedUser = await Profile.findOne({ walletAddress: dislikedWalletAddress });
    if (!dislikedUser) {
      return res.status(404).json({ error: 'User to dislike not found' });
    }

    // If the user has already liked this person, disliking is not allowed
    if (currentUser.likedUsers.includes(dislikedUser._id)) {
      return res.status(400).json({ error: 'You have already liked this user, cannot dislike.' });
    }

    // Otherwise, add dislikedUser._id if not already present
    if (!currentUser.dislikedUsers.includes(dislikedUser._id)) {
      currentUser.dislikedUsers.push(dislikedUser._id);
    }

    await currentUser.save();
    res.status(200).json({ message: 'Dislike recorded' });
  } catch (error) {
    console.error('Error disliking user:', error);
    res.status(500).json({ error: 'Failed to dislike user' });
  }
});

/**
 * POST /api/unmatch/:id
 * Unmatches the user with ID :id from the current user.
 */
router.post('/unmatch/:walletAddress', async (req, res) => {
  try {
    const { currentWalletAddress } = req.body;
    const { walletAddress: unmatchedWalletAddress } = req.params;

    if (!currentWalletAddress) {
      return res.status(400).json({ error: 'No current wallet address provided' });
    }

    const currentUser = await Profile.findOne({ walletAddress: currentWalletAddress });
    const unmatchedUser = await Profile.findOne({ walletAddress: unmatchedWalletAddress });

    if (!currentUser || !unmatchedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove each other from matchedUsers
    currentUser.matchedUsers = currentUser.matchedUsers.filter(
      id => id.toString() !== unmatchedUser._id.toString()
    );
    unmatchedUser.matchedUsers = unmatchedUser.matchedUsers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await unmatchedUser.save();

    res.status(200).json({ message: 'Unmatched successfully' });
  } catch (error) {
    console.error('Error unmatching user:', error);
    res.status(500).json({ error: 'Failed to unmatch user' });
  }
});

module.exports = router;
