// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

/**
 * GET /api/potential-matches?userId=<someUserId>
 * Returns an array of new profiles for the current user to swipe on,
 * excluding themselves and any they've already liked/disliked/matched.
 */
router.get('/potential-matches', async (req, res) => {
  try {
    const userId = req.query.userId; // e.g. /api/potential-matches?userId=abc123
    if (!userId) {
      return res.status(400).json({ error: 'No userId provided in query' });
    }

    // Find current user's profile
    const currentUser = await Profile.findById(userId);
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

    // Example: filter logic could also check gender or "lookingFor" if desired
    const potential = await Profile.find({
      _id: { $nin: excludeIds },
      // Additional filter logic here if you want, e.g. matching gender preferences
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
router.get('/matches', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'No userId provided in query' });
    }

    const currentUser = await Profile.findById(userId);
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
router.post('/like/:id', async (req, res) => {
  try {
    const currentUserId = req.body.userId; // from request body
    const likedUserId = req.params.id;

    if (!currentUserId) {
      return res.status(400).json({ error: 'No current user ID provided' });
    }

    const currentUser = await Profile.findById(currentUserId);
    const likedUser = await Profile.findById(likedUserId);

    if (!currentUser || !likedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent duplicate likes
    if (currentUser.likedUsers.includes(likedUserId)) {
      return res.status(400).json({ error: 'You have already liked this user.' });
    }

    // Add likedUserId to currentUser's likedUsers array
    currentUser.likedUsers.push(likedUserId);

    // Remove from dislikedUsers if present
    currentUser.dislikedUsers = currentUser.dislikedUsers.filter(
      id => id.toString() !== likedUserId
    );

    let isMatch = false;
    // If likedUser also liked currentUser, form a match
    if (likedUser.likedUsers.includes(currentUserId)) {
      if (!currentUser.matchedUsers.includes(likedUserId)) {
        currentUser.matchedUsers.push(likedUserId);
      }
      if (!likedUser.matchedUsers.includes(currentUserId)) {
        likedUser.matchedUsers.push(currentUserId);
      }
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
router.post('/dislike/:id', async (req, res) => {
  try {
    const currentUserId = req.body.userId;
    const dislikedUserId = req.params.id;

    if (!currentUserId) {
      return res.status(400).json({ error: 'No current user ID provided' });
    }

    const currentUser = await Profile.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // If the user has already liked this person, disliking is not allowed
    if (currentUser.likedUsers.includes(dislikedUserId)) {
      return res.status(400).json({ error: 'You have already liked this user, cannot dislike.' });
    }

    // Otherwise, add dislikedUserId if not already present
    if (!currentUser.dislikedUsers.includes(dislikedUserId)) {
      currentUser.dislikedUsers.push(dislikedUserId);
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
router.post('/unmatch/:id', async (req, res) => {
  try {
    const currentUserId = req.body.userId;
    const unmatchedUserId = req.params.id;

    if (!currentUserId) {
      return res.status(400).json({ error: 'No current user ID provided' });
    }

    const currentUser = await Profile.findById(currentUserId);
    const unmatchedUser = await Profile.findById(unmatchedUserId);

    if (!currentUser || !unmatchedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove each other from matchedUsers
    currentUser.matchedUsers = currentUser.matchedUsers.filter(
      id => id.toString() !== unmatchedUserId
    );
    unmatchedUser.matchedUsers = unmatchedUser.matchedUsers.filter(
      id => id.toString() !== currentUserId
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
