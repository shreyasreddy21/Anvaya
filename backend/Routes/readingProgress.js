import express from 'express';
import ReadingProgress, { READING_LEVELS } from '../models/ReadingProgress.js';
import PhonemeTapSession from '../models/PhonemeTapSession.js';
import LetterSoundSession from '../models/LetterSoundSession.js';

const router = express.Router();

async function getOrCreate(childUsername) {
  let rp = await ReadingProgress.findOne({ childUsername });
  if (!rp) {
    rp = await ReadingProgress.create({ childUsername });
  }
  return rp;
}

// GET /api/reading-progress/:childUsername
router.get('/:childUsername', async (req, res) => {
  try {
    const rp = await getOrCreate(req.params.childUsername);
    res.json(rp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reading-progress/:childUsername/check — run auto-advancement
router.post('/:childUsername/check', async (req, res) => {
  const username = req.params.childUsername;
  try {
    const rp = await getOrCreate(username);

    if (rp.therapistOverride) {
      return res.json({ advanced: false, reason: 'therapist_override', currentLevel: rp.currentLevel });
    }

    const currentIdx = READING_LEVELS.indexOf(rp.currentLevel);
    if (currentIdx === READING_LEVELS.length - 1) {
      return res.json({ advanced: false, reason: 'max_level', currentLevel: rp.currentLevel });
    }

    const [phonemeSessions, letterSoundSessions] = await Promise.all([
      PhonemeTapSession.find({ username, phonicsLevel: rp.currentLevel })
        .sort({ createdAt: -1 }).limit(3).select('overallAccuracy'),
      LetterSoundSession.find({ username, phonicsLevel: rp.currentLevel })
        .sort({ createdAt: -1 }).limit(3).select('overallAccuracy'),
    ]);

    const combined = [...phonemeSessions, ...letterSoundSessions];
    if (combined.length < 3) {
      rp.lastChecked = new Date();
      await rp.save();
      return res.json({ advanced: false, reason: 'insufficient_data', sessionsFound: combined.length, currentLevel: rp.currentLevel });
    }

    const avgAccuracy = combined.reduce((s, x) => s + x.overallAccuracy, 0) / combined.length;

    if (avgAccuracy >= 85) {
      const newLevel = READING_LEVELS[currentIdx + 1];
      rp.levelHistory.push({ fromLevel: rp.currentLevel, toLevel: newLevel, advancedBy: 'auto' });
      rp.currentLevel = newLevel;
      rp.lastChecked = new Date();
      await rp.save();
      return res.json({ advanced: true, newLevel, avgAccuracy: Math.round(avgAccuracy), currentLevel: newLevel });
    }

    rp.lastChecked = new Date();
    await rp.save();
    res.json({ advanced: false, reason: 'below_threshold', avgAccuracy: Math.round(avgAccuracy), currentLevel: rp.currentLevel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reading-progress/:childUsername/override — therapist manually sets level
router.patch('/:childUsername/override', async (req, res) => {
  const { level, therapistId, note } = req.body;
  if (!level || !READING_LEVELS.includes(level)) {
    return res.status(400).json({ message: `level must be one of: ${READING_LEVELS.join(', ')}` });
  }
  try {
    const rp = await getOrCreate(req.params.childUsername);
    rp.levelHistory.push({
      fromLevel: rp.currentLevel,
      toLevel: level,
      advancedBy: 'therapist',
      note: note || '',
    });
    rp.currentLevel = level;
    rp.therapistOverride = true;
    rp.overriddenBy = therapistId || null;
    await rp.save();
    res.json(rp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reading-progress/:childUsername/release-override — re-enable auto advancement
router.patch('/:childUsername/release-override', async (req, res) => {
  try {
    const rp = await getOrCreate(req.params.childUsername);
    rp.therapistOverride = false;
    rp.overriddenBy = null;
    await rp.save();
    res.json(rp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
