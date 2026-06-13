/**
 * /api/sight-words
 *
 * GET  /due      — Return words due for review (SM-2 spaced repetition)
 * POST /response — Record a review response and update SM-2 state
 * GET  /stats    — Aggregate mastery stats for a user
 *
 * Security:
 *  • All endpoints require a valid JWT (requireAuth)
 *  • /due and /response are child-only; username is always from JWT
 *  • /stats allows child, therapist, superadmin
 */
import express from 'express';
import SightWordProgress from '../models/SightWordProgress.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { applySM2 } from '../utils/sm2.js';

const router = express.Router();

// GET /api/sight-words/due — words due for review
router.get('/due',
  requireAuth,
  requireRole('child'),
  async (req, res) => {
    try {
      const username = req.user.username;
      const count = Math.min(parseInt(req.query.count, 10) || 20, 50);
      const now = new Date();

      // Words whose nextReview date has passed
      const due = await SightWordProgress
        .find({ username, nextReview: { $lte: now } })
        .sort({ nextReview: 1 })
        .limit(count)
        .lean();

      // Pad if we don't have enough due words
      if (due.length < count) {
        const needed = count - due.length;
        const dueIds = due.map(d => d._id);

        // First try words never seen (repetitions === 0), then newest
        const padding = await SightWordProgress
          .find({ username, _id: { $nin: dueIds } })
          .sort({ repetitions: 1, createdAt: -1 })
          .limit(needed)
          .lean();

        return res.json([...due, ...padding]);
      }

      res.json(due);
    } catch (err) {
      console.error('[sight-words] Due fetch error:', err.message);
      res.status(500).json({ error: 'Failed to fetch due words' });
    }
  }
);

// POST /api/sight-words/response — record a review result (SM-2)
router.post('/response',
  requireAuth,
  requireRole('child'),
  async (req, res) => {
    const { word, list, level, quality } = req.body;
    const username = req.user.username;

    // Validation
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return res.status(400).json({ error: 'word is required' });
    }
    if (quality === undefined || typeof quality !== 'number' || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'quality must be a number between 0 and 5' });
    }

    try {
      // Fetch existing doc to read current SM-2 state (or use defaults)
      const existing = await SightWordProgress
        .findOne({ username, word: word.trim() })
        .lean();

      // Apply the SM-2 scheduler (pure, unit-tested in utils/sm2.js)
      const { easeFactor, interval, repetitions, nextReview } = applySM2(quality, {
        easeFactor:  existing?.easeFactor,
        interval:    existing?.interval,
        repetitions: existing?.repetitions,
      });
      const isCorrect = quality >= 3;

      const updated = await SightWordProgress.findOneAndUpdate(
        { username, word: word.trim() },
        {
          $set: {
            easeFactor,
            interval,
            repetitions,
            nextReview,
            lastReview: new Date(),
            ...(list  ? { list }  : {}),
            ...(level ? { level } : {}),
          },
          $inc: {
            totalAttempts: 1,
            totalCorrect:  isCorrect ? 1 : 0,
          },
          // Set username/word on insert
          $setOnInsert: {
            username,
            word: word.trim(),
            list:  list  ?? 'dolch',
            level: level ?? 'pre-primer',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      res.json({ message: 'Response recorded', doc: updated });
    } catch (err) {
      console.error('[sight-words] Response error:', err.message);
      res.status(500).json({ error: 'Failed to record response' });
    }
  }
);

// GET /api/sight-words/stats — mastery aggregates
router.get('/stats',
  requireAuth,
  requireRole('child', 'therapist', 'superadmin'),
  async (req, res) => {
    try {
      let username;

      if (req.user.role === 'child') {
        username = req.user.username;
      } else {
        // Therapist / superadmin must supply query.username
        username = req.query.username;
        if (!username) {
          return res.status(400).json({ error: 'username query param is required' });
        }
      }

      const now = new Date();

      const [totalWords, mastered, dueToday, levelGroups] = await Promise.all([
        SightWordProgress.countDocuments({ username }),
        SightWordProgress.countDocuments({ username, repetitions: { $gte: 5 } }),
        SightWordProgress.countDocuments({ username, nextReview: { $lte: now } }),
        SightWordProgress.aggregate([
          { $match: { username } },
          { $group: { _id: '$level', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
      ]);

      // Convert aggregate array to a plain object { levelName: count }
      const levelBreakdown = Object.fromEntries(
        levelGroups.map(g => [g._id, g.count])
      );

      res.json({ totalWords, mastered, dueToday, levelBreakdown });
    } catch (err) {
      console.error('[sight-words] Stats error:', err.message);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
);

export default router;
