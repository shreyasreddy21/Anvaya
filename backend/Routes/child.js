import express from 'express';
import Child from '../models/Child.js';

const router = express.Router();

// Register child
// Register child
router.post('/', async (req, res) => {
  try {
    const { name, username, password, therapistId } = req.body; // 👈 include therapistId
    const newChild = new Child({ name, username, password, therapistId }); // 👈 save therapistId
    await newChild.save();
    res.status(201).json({ message: 'Child added successfully' });
  } catch (error) {
    console.error('Error adding child:', error);
    res.status(500).json({ error: 'Failed to add child' });
  }
});


// You can add more child-specific routes here (e.g., get all children)
// Get children for a specific therapist
router.get('/', async (req, res) => {
  const therapistId = req.headers['therapist-id']; // Therapist ID passed in headers

  if (!therapistId) {
    return res.status(400).json({ error: 'Therapist ID is required' });
  }

  try {
    const children = await Child.find({ therapistId }); // Filter children by therapistId
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});


export default router;
