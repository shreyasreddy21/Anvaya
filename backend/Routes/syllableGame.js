import express from 'express';
import SyllableGame from '../models/SyllableGame.js';

const router = express.Router();

router.get('/:difficulty', async (req, res) => {
  const { difficulty } = req.params;
  try {
    const words = await SyllableGame.find({ difficulty });
    res.json(words);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
