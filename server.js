const express = require('express');
const mongoose = require('mongoose');
const Redis = require('redis');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mongoose schema/model
const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardSchema);

// Redis connection
const REDIS_URL = process.env.REDIS_URL;
let redisClient;
(async () => {
  try {
    redisClient = Redis.createClient({ url: REDIS_URL });
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
    redisClient = null; // fallback if Redis is not available
  }
})();
const LEADERBOARD_CACHE_KEY = 'starbound:leaderboard:top10';

// Helper: get top 10 from DB
async function getTopLeaderboard() {
  return await LeaderboardEntry.find().sort({ score: -1, date: 1 }).limit(10).lean();
}

// Helper: update cache
async function updateLeaderboardCache() {
  const top10 = await getTopLeaderboard();
  await redisClient.set(LEADERBOARD_CACHE_KEY, JSON.stringify(top10), { EX: 60 }); // cache for 60s
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '/')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Fallback: serve index.html for any other route (for SPA or direct root access)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /api/leaderboard - Get all leaderboard entries (with Redis cache)
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (redisClient) {
      const cached = await redisClient.get(LEADERBOARD_CACHE_KEY);
      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached) });
      }
    }
    const leaderboard = await getTopLeaderboard();
    if (redisClient) {
      await redisClient.set(LEADERBOARD_CACHE_KEY, JSON.stringify(leaderboard), { EX: 60 });
    }
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// POST /api/leaderboard - Add new score
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Player name is required and must be a non-empty string' });
    }
    if (!score || typeof score !== 'number' || score < 0) {
      return res.status(400).json({ success: false, error: 'Score is required and must be a positive number' });
    }
    const newEntry = await LeaderboardEntry.create({ name: name.trim(), score, date: new Date() });
    if (redisClient) await redisClient.del(LEADERBOARD_CACHE_KEY);
    const leaderboard = await getTopLeaderboard();
    const rank = leaderboard.findIndex(entry => entry._id.toString() === newEntry._id.toString()) + 1;
    res.json({ success: true, message: 'Score added successfully', data: newEntry, rank });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add score' });
  }
});

// DELETE /api/leaderboard - Clear all scores
app.delete('/api/leaderboard', async (req, res) => {
  try {
    await LeaderboardEntry.deleteMany({});
    if (redisClient) await redisClient.del(LEADERBOARD_CACHE_KEY);
    res.json({ success: true, message: 'Leaderboard cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clear leaderboard' });
  }
});

// GET /api/leaderboard/export - Export leaderboard as JSON
app.get('/api/leaderboard/export', async (req, res) => {
  try {
    const scoreboard = await getTopLeaderboard();
    const exportData = { scoreboard };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="starbound_leaderboard.json"');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to export leaderboard' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Starbound Leaderboard API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, async () => {
  // Optionally seed DB with default data if empty
  const count = await LeaderboardEntry.countDocuments();
  if (count === 0) {
    const defaultData = [
      { name: 'Captain Nova', score: 15420 },
      { name: 'StarSeeker', score: 12850 },
      { name: 'CosmicWanderer', score: 11200 },
      { name: 'VoidExplorer', score: 9750 },
      { name: 'NebulaRider', score: 8900 }
    ];
    await LeaderboardEntry.insertMany(defaultData);
    console.log('Leaderboard seeded with default data');
  }
  console.log(`🚀 Starbound Leaderboard API running on http://localhost:${PORT}`);
  console.log('📊 Leaderboard data stored in MongoDB');
});

module.exports = app;
