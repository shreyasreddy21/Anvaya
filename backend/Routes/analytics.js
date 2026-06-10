import express from 'express';
import mongoose from 'mongoose';
import PhonemeTapSession    from '../models/PhonemeTapSession.js';
import LetterSoundSession   from '../models/LetterSoundSession.js';
import RANSession           from '../models/RANSession.js';
import VerbalMemorySession  from '../models/VerbalMemorySession.js';

const router = express.Router();

// GET /api/analytics/:childUsername
router.get('/:childUsername', async (req, res) => {
  const username = req.params.childUsername;
  try {
    const GameSession = mongoose.models.GameSession;

    const [phonemeSessions, letterSoundSessions, ranSessions, vmSessions, gameSessions] = await Promise.all([
      PhonemeTapSession.find({ username }).sort({ createdAt: 1 }).select('createdAt overallAccuracy phonicsLevel difficulty moodAtStart'),
      LetterSoundSession.find({ username }).sort({ createdAt: 1 }).select('createdAt overallAccuracy phonicsLevel difficulty moodAtStart'),
      RANSession.find({ username }).sort({ createdAt: 1 }).select('createdAt itemsPerMinute accuracy category difficulty'),
      VerbalMemorySession.find({ username }).sort({ createdAt: 1 }).select('createdAt workingMemoryScore maxSequenceLength overallAccuracy'),
      GameSession ? GameSession.find({ username }).sort({ createdAt: 1 }).select('createdAt startTime endTime gameName expressions moodAtStart') : [],
    ]);

    // Phoneme accuracy trend (merge phoneme + letter-sound)
    const phonemeAccuracy = [
      ...phonemeSessions.map(s => ({ date: s.createdAt, accuracy: s.overallAccuracy, level: s.phonicsLevel, game: 'phonemetap' })),
      ...letterSoundSessions.map(s => ({ date: s.createdAt, accuracy: s.overallAccuracy, level: s.phonicsLevel, game: 'lettersound' })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // RAN speed trend
    const ranSpeed = ranSessions.map(s => ({
      date: s.createdAt,
      itemsPerMinute: s.itemsPerMinute,
      accuracy: s.accuracy,
      category: s.category,
    }));

    // Working memory trend
    const workingMemory = vmSessions.map(s => ({
      date: s.createdAt,
      wms: s.workingMemoryScore,
      maxLen: s.maxSequenceLength,
      accuracy: s.overallAccuracy,
    }));

    // Mood distribution from gameSessions
    const moodDistribution = {};
    (gameSessions || []).forEach(s => {
      if (s.moodAtStart) moodDistribution[s.moodAtStart] = (moodDistribution[s.moodAtStart] || 0) + 1;
    });

    // Session durations
    const sessionDurations = (gameSessions || [])
      .filter(s => s.startTime && s.endTime)
      .map(s => ({
        date: s.createdAt,
        durationMin: Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000 * 10) / 10,
        game: s.gameName,
      }));

    // Frustration trend — pct of angry+sad expressions per session
    const frustrationTrend = (gameSessions || [])
      .filter(s => s.expressions && s.expressions.length > 0)
      .map(s => {
        const total = s.expressions.length;
        const angry = s.expressions.filter(e => e.expression === 'angry').length;
        const sad   = s.expressions.filter(e => e.expression === 'sad').length;
        return {
          date: s.createdAt,
          angryPct: Math.round((angry / total) * 100),
          sadPct:   Math.round((sad / total) * 100),
          game: s.gameName,
        };
      });

    res.json({ phonemeAccuracy, ranSpeed, workingMemory, moodDistribution, sessionDurations, frustrationTrend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
