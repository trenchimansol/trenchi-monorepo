// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import your route files
const messagesRouter = require('./routes/messages');
const subscriptionRoutes = require('./routes/subscription');
const profileRoutes = require('./routes/profileRoutes');
const leaderboardRoutes = require('./routes/leaderboard');
const matchRoutes = require('./routes/matchRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB Atlas and specify the database name 'test'
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'test',
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Enable CORS for all routes
app.use(cors());

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Mount routes under /api
app.use('/api/messages', messagesRouter);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/matches', matchRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Trenchi backend is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
