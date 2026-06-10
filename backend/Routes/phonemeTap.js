import express from 'express';
import PhonemeTapSession from '../models/PhonemeTapSession.js';

const router = express.Router();

// POST /api/phoneme-tap — save a completed session
router.post('/', async (req, res) => {
  try {
    const session = new PhonemeTapSession(req.body);
    await session.save();
    res.status(201).json({ message: 'Phoneme tap session saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/phoneme-tap?username=alice — fetch sessions for a user
router.get('/', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'username is required' });
  try {
    const sessions = await PhonemeTapSession.find({ username }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch phoneme tap sessions' });
  }
});

// GET /api/phoneme-tap/summary?username=alice
// Aggregated stats: avg accuracy per phonicsLevel, trend over time
router.get('/summary', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'username is required' });
  try {
    const sessions = await PhonemeTapSession.find({ username });
    if (sessions.length === 0) return res.json({ sessions: 0, avgAccuracy: 0, byLevel: {} });

    const byLevel = {};
    sessions.forEach(s => {
      const lv = s.phonicsLevel || 'unknown';
      if (!byLevel[lv]) byLevel[lv] = { totalAccuracy: 0, count: 0 };
      byLevel[lv].totalAccuracy += s.overallAccuracy;
      byLevel[lv].count += 1;
    });
    Object.keys(byLevel).forEach(lv => {
      byLevel[lv].avgAccuracy = +(byLevel[lv].totalAccuracy / byLevel[lv].count).toFixed(1);
    });

    const avgAccuracy = +(sessions.reduce((s, x) => s + x.overallAccuracy, 0) / sessions.length).toFixed(1);
    res.json({ sessions: sessions.length, avgAccuracy, byLevel });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute summary' });
  }
});

export default router;
