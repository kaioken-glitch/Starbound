const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

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

// Initialize leaderboard file if it doesn't exist
async function initializeLeaderboard() {
  try {
    await fs.access(LEADERBOARD_FILE);
  } catch (error) {
    // File doesn't exist, create it with default data
    const defaultData = {
      scoreboard: [
        { name: 'Captain Nova', score: 15420, date: new Date().toISOString() },
        { name: 'StarSeeker', score: 12850, date: new Date().toISOString() },
        { name: 'CosmicWanderer', score: 11200, date: new Date().toISOString() },
        { name: 'VoidExplorer', score: 9750, date: new Date().toISOString() },
        { name: 'NebulaRider', score: 8900, date: new Date().toISOString() }
      ]
    };
    await fs.writeFile(LEADERBOARD_FILE, JSON.stringify(defaultData, null, 2));
    console.log('Leaderboard file created with default data');
  }
}

// Helper function to read leaderboard
async function readLeaderboard() {
  try {
    const data = await fs.readFile(LEADERBOARD_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    // Return the scoreboard array, or empty array if structure is invalid
    return jsonData.scoreboard || [];
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    return [];
  }
}

// Helper function to write leaderboard
async function writeLeaderboard(scoreboard) {
  try {
    const data = { scoreboard: scoreboard };
    await fs.writeFile(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing leaderboard:', error);
    return false;
  }
}

// GET /api/leaderboard - Get all leaderboard entries
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await readLeaderboard();
    // Sort by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// POST /api/leaderboard - Add new score
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { name, score } = req.body;
    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Player name is required and must be a non-empty string'
      });
    }
    if (!score || typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Score is required and must be a positive number'
      });
    }
    const leaderboard = await readLeaderboard();
    // Add new entry
    const newEntry = {
      name: name.trim(),
      score: score,
      date: new Date().toISOString()
    };
    leaderboard.push(newEntry);
    // Sort and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);
    const success = await writeLeaderboard(top10);
    if (success) {
      res.json({
        success: true,
        message: 'Score added successfully',
        data: newEntry,
        rank: top10.findIndex(entry => entry.name === newEntry.name && entry.score === newEntry.score) + 1
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save score'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add score'
    });
  }
});

// DELETE /api/leaderboard - Clear all scores
app.delete('/api/leaderboard', async (req, res) => {
  try {
    const success = await writeLeaderboard([]);
    if (success) {
      res.json({
        success: true,
        message: 'Leaderboard cleared successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to clear leaderboard'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear leaderboard'
    });
  }
});

// GET /api/leaderboard/export - Export leaderboard as JSON
app.get('/api/leaderboard/export', async (req, res) => {
  try {
    const scoreboard = await readLeaderboard();
    const exportData = { scoreboard: scoreboard };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="starbound_leaderboard.json"');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export leaderboard'
    });
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
  await initializeLeaderboard();
  console.log(`🚀 Starbound Leaderboard API running on http://localhost:${PORT}`);
  console.log(`📊 Leaderboard data stored in: ${LEADERBOARD_FILE}`);
});

module.exports = app;
