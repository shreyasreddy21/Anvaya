/**
 * /api/morphology
 *
 * POST / — Child submits a morphology game session
 * GET  / — Fetch sessions (child sees own; therapist/superadmin can query by username)
 *
 * Security:
 *  • All endpoints require a valid JWT (requireAuth)
 *  • POST is child-only; username is always taken from JWT, never from body
 *  • GET allows child, therapist, superadmin
 */
import express from 'express';
import MorphologySession from '../models/MorphologySession.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/morphology — submit a morphology session (child only)
router.post('/',
  requireAuth,
  requireRole('child'),
  async (req, res) => {
    const {
      difficulty,
      gameMode,
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      questions,
      moodAtStart,
    } = req.body;

    // Validation
    if (totalQuestions === undefined || typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      return res.status(400).json({ error: 'totalQuestions must be greater than 0' });
    }
    if (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100)) {
      return res.status(400).json({ error: 'accuracy must be between 0 and 100' });
    }

    try {
      const session = new MorphologySession({
        username:       req.user.username, // always from JWT
        difficulty:     difficulty     ?? 'easy',
        gameMode:       gameMode       ?? 'mixed',
        score:          score          ?? 0,
        totalQuestions,
        correctAnswers: correctAnswers ?? 0,
        accuracy:       accuracy       ?? 0,
        questions:      Array.isArray(questions) ? questions : [],
        moodAtStart:    moodAtStart    ?? null,
      });

      await session.save();
      res.status(201).json({ message: 'Morphology session saved', session });
    } catch (err) {
      console.error('[morphology] Save error:', err.message);
      res.status(500).json({ error: 'Failed to save morphology session' });
    }
  }
);

// GET /api/morphology — list sessions
router.get('/',
  requireAuth,
  requireRole('child', 'therapist', 'superadmin'),
  async (req, res) => {
    try {
      let filter = {};

      if (req.user.role === 'child') {
        // Child always sees only their own data
        filter.username = req.user.username;
      } else {
        // Therapist / superadmin must supply query.username
        const { username } = req.query;
        if (!username) {
          return res.status(400).json({ error: 'username query param is required' });
        }
        filter.username = username;
      }

      const sessions = await MorphologySession
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.json(sessions);
    } catch (err) {
      console.error('[morphology] Fetch error:', err.message);
      res.status(500).json({ error: 'Failed to fetch morphology sessions' });
    }
  }
);

export default router;
