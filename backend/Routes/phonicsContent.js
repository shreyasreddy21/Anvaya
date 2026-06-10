import express from 'express';
import PhonicsContent from '../models/PhonicsContent.js';

const router = express.Router();

// GET /api/phonics/levels?gameType=letter_bridge
// Returns the distinct phonics levels that have content for the given gameType.
router.get('/levels', async (req, res) => {
  const { gameType } = req.query;
  try {
    const filter = gameType ? { gameType } : {};
    const levels = await PhonicsContent.distinct('level', filter);
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch phonics levels' });
  }
});

// GET /api/phonics?level=CVC&gameType=letter_bridge&difficulty=easy
// Required: level, gameType.  Optional: difficulty.
router.get('/', async (req, res) => {
  const { level, gameType, difficulty } = req.query;

  if (!level || !gameType) {
    return res.status(400).json({ error: 'level and gameType are required query params' });
  }

  try {
    const filter = { level, gameType };
    if (difficulty) filter.difficulty = difficulty;
    const docs = await PhonicsContent.find(filter);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch phonics content' });
  }
});

// POST /api/phonics  — admin / seed use: insert a single content item
router.post('/', async (req, res) => {
  try {
    const doc = new PhonicsContent(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
