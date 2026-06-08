import express from 'express';
import Therapist from '../models/Therapist.js';
import Child from '../models/Child.js';

const router = express.Router();

// Add new therapist
router.post('/therapists', async (req, res) => {
  try {
    const newTherapist = new Therapist(req.body);
    await newTherapist.save();
    res.status(201).json({ message: "Therapist added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all therapists and their children
router.get('/therapists-with-children', async (req, res) => {
  try {
    const therapists = await Therapist.find();
    const result = [];

    for (const therapist of therapists) {
      const children = await Child.find({ therapistId: therapist.therapistId });
      result.push({ therapist, children });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
