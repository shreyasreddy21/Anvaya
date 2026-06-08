// Routes/emotion.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route: POST /api/emotion/predict
router.post('/predict', async (req, res) => {
  try {
    // Forward the request body to Flask server
    const response = await axios.post('http://127.0.0.1:5000/predict', req.body, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Return Flask response to client
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error forwarding to Flask:', error.message);
    res.status(500).json({ error: 'Emotion detection failed' });
  }
});

export default router;
