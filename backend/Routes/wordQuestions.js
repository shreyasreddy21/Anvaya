import express from "express";
import WordQuestion from "../models/WordQuestion.js";

const router = express.Router();

// Route: GET /api/wordQuestions/:difficulty
router.get("/:difficulty", async (req, res) => {
  try {
    const difficulty = req.params.difficulty;
    const questions = await WordQuestion.find({ difficulty });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
