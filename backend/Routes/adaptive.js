/**
 * /api/adaptive
 *
 * GET /:childUsername/recommendation?game=<key>&current=<difficulty>
 *   Returns a data-driven difficulty recommendation for a child + game, based
 *   on recent accuracy and recent emotional affect (frustration). Read-only —
 *   persists nothing. The child (for self) or a therapist/superadmin may call.
 */
import express from 'express';
import mongoose from 'mongoose';
import PhonemeTapSession   from '../models/PhonemeTapSession.js';
import LetterSoundSession  from '../models/LetterSoundSession.js';
import RANSession          from '../models/RANSession.js';
import VerbalMemorySession from '../models/VerbalMemorySession.js';
import MorphologySession   from '../models/MorphologySession.js';
import { requireAuth } from '../middleware/auth.js';
import { recommendDifficulty, frustrationFromExpressions } from '../utils/adaptiveDifficulty.js';

const router = express.Router();

// Map a game key → its session model + the field holding accuracy (0–100).
const GAME_MAP = {
  phonemetap:   { model: PhonemeTapSession,   accuracyField: 'overallAccuracy' },
  lettersound:  { model: LetterSoundSession,  accuracyField: 'overallAccuracy' },
  ran:          { model: RANSession,          accuracyField: 'accuracy' },
  verbalmemory: { model: VerbalMemorySession, accuracyField: 'overallAccuracy' },
  morphology:   { model: MorphologySession,   accuracyField: 'accuracy' },
};

const RECENT_N = 5;

router.get('/:childUsername/recommendation', requireAuth, async (req, res) => {
  try {
    // Children may only query their own data.
    const username = req.user.role === 'child' ? req.user.username : req.params.childUsername;
    const game    = String(req.query.game || '').toLowerCase();
    const current = String(req.query.current || 'easy').toLowerCase();

    const entry = GAME_MAP[game];
    if (!entry) {
      return res.json(recommendDifficulty({ recentAccuracies: [], currentDifficulty: current }));
    }

    // Recent accuracy for this game (newest first), and recent affect samples.
    const GameSession = mongoose.models.GameSession;
    const [sessions, gameSessions] = await Promise.all([
      entry.model.find({ username }).sort({ createdAt: -1 }).limit(RECENT_N).select(`${entry.accuracyField} createdAt`),
      GameSession
        ? GameSession.find({ username }).sort({ createdAt: -1 }).limit(RECENT_N).select('expressions')
        : Promise.resolve([]),
    ]);

    const recentAccuracies = sessions
      .map((s) => s[entry.accuracyField])
      .filter((v) => typeof v === 'number' && !Number.isNaN(v));

    // Average frustration across recent sessions that carry expression samples.
    const frustrationScores = (gameSessions || [])
      .map((s) => frustrationFromExpressions(s.expressions))
      .filter((v) => v > 0);
    const frustrationScore = frustrationScores.length
      ? frustrationScores.reduce((a, b) => a + b, 0) / frustrationScores.length
      : 0;

    const recommendation = recommendDifficulty({
      recentAccuracies,
      frustrationScore,
      currentDifficulty: current,
    });

    res.json(recommendation);
  } catch (err) {
    console.error('[adaptive] recommendation error:', err.message);
    res.status(500).json({ error: 'Failed to compute recommendation' });
  }
});

export default router;
