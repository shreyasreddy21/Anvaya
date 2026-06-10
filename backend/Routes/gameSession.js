import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Expression subdocument schema
const expressionSchema = new mongoose.Schema({
  expression: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

// Game session schema
const gameSessionSchema = new mongoose.Schema({
    username:   { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    startTime:  { type: Date, required: true },
    endTime:    { type: Date, required: true },
    gameName:   { type: String, required: true },
    expressions: [expressionSchema],
    score:      { type: Number, required: true },
    // Child's self-reported mood from the WelcomeScreen mood check-in.
    // Optional — older sessions without this field remain valid.
    moodAtStart:  { type: String, default: null },
    // Phonics level being practiced when the session was played.
    // Set only for games that have a level selector (e.g. LetterBridge).
    phonicsLevel: { type: String, default: null },
  });
  
// Use existing model if already defined (for hot reload compatibility)
const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', gameSessionSchema);

// POST: Save a new session
router.post('/', async (req, res) => {
  try {
    console.log("✅ Incoming POST /api/sessions");
    console.log("📦 Payload:", req.body);

    const { username, difficulty, startTime, endTime, expressions, gameName, score, moodAtStart, phonicsLevel } = req.body;

    const session = new GameSession({
        username,
        difficulty,
        startTime,
        endTime,
        expressions,
        gameName,
        score,
        moodAtStart:  moodAtStart  || null,
        phonicsLevel: phonicsLevel || null,
    });

    await session.save();

    console.log("✅ Session saved successfully");
    res.status(201).json({ message: 'Session saved successfully' });

  } catch (err) {
    if (err.name === 'ValidationError') {
      console.error("❌ Mongoose Validation Error:", err.errors);
    } else {
      console.error("❌ Unexpected Error:", err);
    }
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// GET: Fetch sessions by username
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const sessions = await GameSession.find({ username });
    res.json(sessions);
  } catch (err) {
    console.error("❌ Failed to fetch sessions:", err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

export default router;
