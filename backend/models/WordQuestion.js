import mongoose from 'mongoose';

const PHONICS_LEVELS = ['CVC', 'Blends', 'Digraphs', 'VowelPatterns', 'AdvancedPatterns'];

const wordQuestionSchema = new mongoose.Schema({
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  image:        { type: String, required: true },
  word:         { type: String, required: true },
  hint:         { type: String, required: true },
  phonicsLevel: { type: String, enum: PHONICS_LEVELS, default: null },
});

const WordQuestion = mongoose.model('WordQuestion', wordQuestionSchema);
export default WordQuestion;
