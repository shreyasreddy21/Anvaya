import express from 'express';
import AdaptationLog from '../models/AdaptationLog.js';

const router = express.Router();

// POST /api/adaptation-log — record an adaptation event
router.post('/', async (req, res) => {
  const { username, gameKey, emotionDetected, previousDifficulty, newDifficulty, backgroundChange, triggerType, sessionId } = req.body;
  if (!username || !gameKey) return res.status(400).json({ message: 'username and gameKey required' });
  try {
    const log = new AdaptationLog({ username, gameKey, emotionDetected, previousDifficulty, newDifficulty, backgroundChange, triggerType, sessionId });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/adaptation-log?username=&gameKey=&limit=
router.get('/', async (req, res) => {
  const { username, gameKey, limit = 50 } = req.query;
  if (!username) return res.status(400).json({ message: 'username required' });
  try {
    const query = { username };
    if (gameKey) query.gameKey = gameKey;
    const logs = await AdaptationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
