/**
 * /api/fluency
 *
 * GET /   — Fetch fluency sessions (child sees own; therapist/superadmin can query by username)
 * POST /  — Child submits a new fluency session
 *
 * Security:
 *  • All endpoints require a valid JWT (requireAuth)
 *  • POST is child-only; username is always taken from JWT, never from body
 *  • GET allows child, therapist, superadmin
 */
import express from 'express';
import FluencySession from '../models/FluencySession.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/fluency — list sessions
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
        // Therapist / superadmin may scope by query.username
        if (req.query.username) {
          filter.username = req.query.username;
        }
      }

      const sessions = await FluencySession
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.json(sessions);
    } catch (err) {
      console.error('[fluency] Fetch error:', err.message);
      res.status(500).json({ error: 'Failed to fetch fluency sessions' });
    }
  }
);

// POST /api/fluency — submit a fluency session (child only)
router.post('/',
  requireAuth,
  requireRole('child'),
  async (req, res) => {
    const {
      passageId,
      passageTitle,
      wordCount,
      timeSeconds,
      wpm,
      accuracy,
      errors,
      moodAtStart,
    } = req.body;

    // Validation
    if (!passageId || typeof passageId !== 'string' || passageId.trim().length === 0) {
      return res.status(400).json({ error: 'passageId is required' });
    }
    if (wpm !== undefined && (typeof wpm !== 'number' || wpm < 0 || wpm > 600)) {
      return res.status(400).json({ error: 'wpm must be between 0 and 600' });
    }
    if (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100)) {
      return res.status(400).json({ error: 'accuracy must be between 0 and 100' });
    }

    try {
      const session = new FluencySession({
        username:     req.user.username, // always from JWT
        passageId:    passageId.trim(),
        passageTitle: passageTitle ?? '',
        wordCount:    wordCount    ?? 0,
        timeSeconds:  timeSeconds  ?? 0,
        wpm:          wpm          ?? 0,
        accuracy:     accuracy     ?? 0,
        errors:       Array.isArray(errors) ? errors : [],
        moodAtStart:  moodAtStart  ?? null,
      });

      await session.save();
      res.status(201).json({ message: 'Fluency session saved', session });
    } catch (err) {
      console.error('[fluency] Save error:', err.message);
      res.status(500).json({ error: 'Failed to save fluency session' });
    }
  }
);

export default router;
