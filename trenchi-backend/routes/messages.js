const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Profile = require('../models/Profile');

// Get all conversations for a user
router.get('/conversations/:walletAddress', async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    // Find all messages where the user is either sender or receiver
    try {
      const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: walletAddress },
            { receiverId: walletAddress }
          ]
        }
      },
      // Group by conversation (combine sender and receiver)
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', walletAddress] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $last: '$content' },
          timestamp: { $last: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiverId', walletAddress] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      // Sort by latest message
      { $sort: { timestamp: -1 } }
    ]);

      // Get user details for each conversation
      const conversations = await Promise.all(messages.map(async (msg) => {
        const otherProfile = await Profile.findOne({ walletAddress: msg._id });
        return {
          walletAddress: msg._id,
          name: otherProfile ? otherProfile.name : 'Unknown User',
          photos: otherProfile ? otherProfile.images : [],
          lastMessage: msg.lastMessage,
          timestamp: msg.timestamp,
          unreadCount: msg.unreadCount
        };
      }));

      res.json(conversations);
    } catch (error) {
      console.error('Error in /conversations:', error);
      next(error);
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get chat history between two users
router.get('/history/:walletAddress/:otherWalletAddress', async (req, res) => {
  try {
    const { walletAddress, otherWalletAddress } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: walletAddress, receiverId: otherWalletAddress },
        { senderId: otherWalletAddress, receiverId: walletAddress }
      ]
    })
    .sort({ timestamp: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: otherWalletAddress,
        receiverId: walletAddress,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const message = new Message({
      senderId,
      receiverId,
      content
    });

    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router;
