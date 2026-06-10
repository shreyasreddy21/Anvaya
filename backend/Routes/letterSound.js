import express from 'express';
import LetterSoundSession from '../models/LetterSoundSession.js';

const router = express.Router();

// POST /api/letter-sound — save a completed session
router.post('/', async (req, res) => {
  try {
    const session = new LetterSoundSession(req.body);
    await session.save();
    res.status(201).json({ message: 'Letter sound session saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/letter-sound?username=alice
router.get('/', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'username is required' });
  try {
    const sessions = await LetterSoundSession.find({ username }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch letter sound sessions' });
  }
});

// GET /api/letter-sound/summary?username=alice
router.get('/summary', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'username is required' });
  try {
    const sessions = await LetterSoundSession.find({ username });
    if (sessions.length === 0) return res.json({ sessions: 0, avgAccuracy: 0, avgReactionTimeMs: 0, byLevel: {} });

    const byLevel = {};
    sessions.forEach(s => {
      const lv = s.phonicsLevel || 'unknown';
      if (!byLevel[lv]) byLevel[lv] = { totalAccuracy: 0, totalReaction: 0, count: 0 };
      byLevel[lv].totalAccuracy  += s.overallAccuracy;
      byLevel[lv].totalReaction  += s.avgReactionTimeMs;
      byLevel[lv].count          += 1;
    });
    Object.keys(byLevel).forEach(lv => {
      byLevel[lv].avgAccuracy      = +(byLevel[lv].totalAccuracy  / byLevel[lv].count).toFixed(1);
      byLevel[lv].avgReactionTimeMs= +(byLevel[lv].totalReaction  / byLevel[lv].count).toFixed(0);
    });

    const avgAccuracy      = +(sessions.reduce((s, x) => s + x.overallAccuracy,   0) / sessions.length).toFixed(1);
    const avgReactionTimeMs= +(sessions.reduce((s, x) => s + x.avgReactionTimeMs, 0) / sessions.length).toFixed(0);

    res.json({ sessions: sessions.length, avgAccuracy, avgReactionTimeMs, byLevel });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute summary' });
  }
});

export default router;
