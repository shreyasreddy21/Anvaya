// backend/routes/quiz.js
import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

router.get("/questions", async (req, res) => {
  const { difficulty } = req.query;
  try {
    const questions = await Question.find(difficulty ? { difficulty } : {});
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

export default router;
