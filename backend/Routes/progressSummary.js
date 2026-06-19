/**
 * /api/progress-summary
 *
 * GET /:childUsername — an LLM-written, plain-language progress narrative for a
 *   therapist, GROUNDED in the child's own structured data. Every number the
 *   model can state comes from the snapshot we build here; the model only writes
 *   prose, so it cannot invent metrics. Read-only — persists nothing.
 *
 * Security: requireAuth + requireRole('therapist','superadmin') + ownership.
 *
 * Requires ANTHROPIC_API_KEY in the environment. If it is absent the route
 * returns 503 (feature disabled) rather than crashing — the rest of the app is
 * unaffected.
 */
import express from 'express';
import mongoose from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';
import PhonemeTapSession   from '../models/PhonemeTapSession.js';
import LetterSoundSession  from '../models/LetterSoundSession.js';
import RANSession          from '../models/RANSession.js';
import VerbalMemorySession from '../models/VerbalMemorySession.js';
import ConfusableSession   from '../models/ConfusableSession.js';
import { requireAuth, requireRole, requireTherapistOwnsChild } from '../middleware/auth.js';

const router = express.Router();

const RECENT = 12;
const NEGATIVE = new Set(['angry', 'sad', 'confused']);

const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

/**
 * Build a compact, FACTUAL snapshot of a child's recent activity. Only fields
 * with real data are included. This object is the sole source of numbers the
 * model is allowed to use.
 */
async function buildSnapshot(username) {
  const GameSession = mongoose.models.GameSession;

  const [phoneme, letterSound, ran, vm, confusable, gameSessions] = await Promise.all([
    PhonemeTapSession.find({ username }).sort({ createdAt: -1 }).limit(RECENT).lean(),
    LetterSoundSession.find({ username }).sort({ createdAt: -1 }).limit(RECENT).lean(),
    RANSession.find({ username }).sort({ createdAt: -1 }).limit(RECENT).lean(),
    VerbalMemorySession.find({ username }).sort({ createdAt: -1 }).limit(RECENT).lean(),
    ConfusableSession.find({ username }).sort({ createdAt: -1 }).limit(RECENT).lean(),
    GameSession ? GameSession.find({ username }).sort({ endTime: -1 }).limit(40).lean() : [],
  ]);

  // Per-game accuracy trends (oldest→newest so the model can describe direction)
  const accTrend = (arr, field) =>
    arr.map((s) => s[field]).filter((v) => typeof v === 'number').reverse();

  const games = {};
  const ptAcc = accTrend(phoneme, 'overallAccuracy');
  if (ptAcc.length) games.phonemeTap = { recentAccuracyPct: ptAcc, avgPct: avg(ptAcc), sessions: ptAcc.length };
  const lsAcc = accTrend(letterSound, 'overallAccuracy');
  if (lsAcc.length) games.letterSound = { recentAccuracyPct: lsAcc, avgPct: avg(lsAcc), sessions: lsAcc.length };
  const ranAcc = accTrend(ran, 'accuracy');
  if (ranAcc.length) games.rapidNaming = { recentAccuracyPct: ranAcc, latestItemsPerMin: ran[0]?.itemsPerMinute ?? null, sessions: ranAcc.length };
  const vmAcc = accTrend(vm, 'overallAccuracy');
  if (vmAcc.length || vm[0]) games.verbalMemory = { recentAccuracyPct: vmAcc, latestWorkingMemoryScore: vm[0]?.workingMemoryScore ?? null, sessions: vm.length };
  const cfAcc = accTrend(confusable, 'overallAccuracy');
  if (cfAcc.length) {
    const latest = confusable[0];
    const pairs = latest?.pairAccuracy
      ? (latest.pairAccuracy instanceof Map ? Object.fromEntries(latest.pairAccuracy) : latest.pairAccuracy)
      : null;
    games.confusableLetters = { recentAccuracyPct: cfAcc, avgPct: avg(cfAcc), latestPairAccuracyPct: pairs, sessions: cfAcc.length };
  }

  // Emotion signal from the shared GameSession expression log.
  let emotion = null;
  const sessions = gameSessions || [];
  if (sessions.length) {
    const counts = {};
    let total = 0, negative = 0;
    for (const s of sessions) {
      for (const e of (s.expressions || [])) {
        const label = String(e?.expression || '').toLowerCase();
        if (!label) continue;
        counts[label] = (counts[label] || 0) + 1;
        total += 1;
        if (NEGATIVE.has(label)) negative += 1;
      }
    }
    if (total > 0) {
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      emotion = { dominant, frustrationRatePct: Math.round((negative / total) * 100), samples: total };
    }
  }

  // Per-game session counts + most recent difficulty, for an engagement picture.
  const byGame = {};
  for (const s of sessions) {
    const g = s.gameName || 'unknown';
    if (!byGame[g]) byGame[g] = { plays: 0, lastDifficulty: s.difficulty || null };
    byGame[g].plays += 1;
  }

  return {
    child: username,
    recentWindow: { totalSessionsConsidered: sessions.length },
    perGameAccuracy: games,
    emotion,
    engagementByGame: byGame,
  };
}

const SYSTEM_PROMPT = `You are assisting a qualified dyslexia therapist by writing a brief progress note about one child, for the therapist's eyes only.

STRICT RULES:
- Use ONLY the numbers and facts in the provided JSON. Never invent or estimate metrics, dates, or events. If a metric is absent, do not mention it.
- If the data is sparse (few sessions), say so plainly and keep the note short — do not over-interpret.
- This is NOT a clinical diagnosis. Do not diagnose, label, or prescribe. Frame everything as observations from gameplay data to support the therapist's own judgment.
- Be warm, concrete, and concise. Refer to the child by their username.
- Quote specific numbers from the data when you make a claim (e.g. "phoneme-tap accuracy rose from 60% to 85% over 5 sessions").

OUTPUT FORMAT (markdown, no preamble):
- A one-sentence overview.
- "Performance": 2–4 bullets on per-game trends, each grounded in a number.
- "Engagement & mood": 1–2 sentences using the emotion/frustration data if present.
- "Suggestions": 1–2 gentle, optional next steps tied directly to the data, phrased for the therapist to consider.`;

router.get('/:childUsername',
  requireAuth,
  requireRole('therapist', 'superadmin'),
  requireTherapistOwnsChild,
  async (req, res) => {
    // ── Feature flag ──────────────────────────────────────────────────────
    // Disabled by default. The feature only runs when BOTH the flag is on AND
    // an API key is present. When off we return 200 with a graceful disabled
    // payload (never an error), so a missing key can never break the UI, the
    // build, or a deploy. No Anthropic client is constructed on this path.
    const aiEnabled =
      process.env.ENABLE_AI_SUMMARIES === 'true' && !!process.env.ANTHROPIC_API_KEY;
    if (!aiEnabled) {
      return res.json({
        username: req.params.childUsername,
        generatedAt: new Date(),
        summary: null,
        disabled: true,
        message: 'AI progress summaries are currently turned off.',
      });
    }

    const username = req.params.childUsername;
    try {
      const snapshot = await buildSnapshot(username);

      // No data at all — return a clear message rather than asking the model to
      // hallucinate a narrative from nothing.
      if (!Object.keys(snapshot.perGameAccuracy).length && !snapshot.emotion && !snapshot.recentWindow.totalSessionsConsidered) {
        return res.json({ username, generatedAt: new Date(), summary: null, message: 'Not enough activity yet to summarise.' });
      }

      const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

      const response = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 1500,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content:
            `Write the progress note for this child. Structured data:\n\n` +
            '```json\n' + JSON.stringify(snapshot, null, 2) + '\n```',
        }],
      });

      const summary = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

      res.json({ username, generatedAt: new Date(), summary, snapshot });
    } catch (err) {
      console.error('[progress-summary] error:', err.message);
      if (err?.status === 429) {
        return res.status(429).json({ error: 'AI service is busy. Please try again in a moment.' });
      }
      res.status(502).json({ error: 'Could not generate the summary right now.' });
    }
  });

export default router;
