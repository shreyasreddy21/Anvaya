import express from 'express';
import MirrorQuestion from '../models/MirrorQuestion.js';

const router = express.Router();

// Route: GET /api/mirrorquestions/:level
router.get('/:level', async (req, res) => {
  const { level } = req.params;

  try {
    const questions = await MirrorQuestion.find({ level });
    res.json(questions);
  } catch (err) {
    console.error("Error fetching mirror questions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
