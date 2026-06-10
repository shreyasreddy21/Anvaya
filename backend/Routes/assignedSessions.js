import express from 'express';
import AssignedSession from '../models/AssignedSession.js';

const router = express.Router();

// GET /api/assigned-sessions?childUsername=&date=   — child's session for a date
router.get('/', async (req, res) => {
  const { childUsername, date } = req.query;
  if (!childUsername) return res.status(400).json({ message: 'childUsername required' });
  try {
    const query = { childUsername };
    if (date) query.date = date;
    const sessions = await AssignedSession.find(query).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/assigned-sessions/therapist?therapistId=&childUsername=
router.get('/therapist', async (req, res) => {
  const { therapistId, childUsername } = req.query;
  if (!therapistId) return res.status(400).json({ message: 'therapistId required' });
  try {
    const query = { therapistId };
    if (childUsername) query.childUsername = childUsername;
    const sessions = await AssignedSession.find(query).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/assigned-sessions — create assignment
router.post('/', async (req, res) => {
  const { therapistId, childUsername, date, games, instructions } = req.body;
  if (!therapistId || !childUsername || !date || !games?.length) {
    return res.status(400).json({ message: 'therapistId, childUsername, date, and games are required' });
  }
  try {
    const session = new AssignedSession({ therapistId, childUsername, date, games, instructions });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/assigned-sessions/:id — update (mark complete, edit)
router.patch('/:id', async (req, res) => {
  try {
    const updated = await AssignedSession.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(req.body.completed ? { completedAt: new Date() } : {}) },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/assigned-sessions/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await AssignedSession.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
