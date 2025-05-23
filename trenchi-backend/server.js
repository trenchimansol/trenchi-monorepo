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

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://trenchmatch.com',
  'https://transcendent-gaufre-9c484c.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'));
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Add CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
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
