import mongoose from 'mongoose';

const wordQuestionSchema = new mongoose.Schema({
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  image: { type: String, required: true },
  word: { type: String, required: true },
  hint: { type: String, required: true },
});

const WordQuestion = mongoose.model('WordQuestion', wordQuestionSchema);
export default WordQuestion;
