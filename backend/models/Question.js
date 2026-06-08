// backend/models/Question.js
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: String,
  image: String,
});

const questionSchema = new mongoose.Schema({
  question: String,
  options: [optionSchema],
  answer: String,
  difficulty: String, // 'Easy', 'Medium', 'Hard'
});

export default mongoose.model("Question", questionSchema);
