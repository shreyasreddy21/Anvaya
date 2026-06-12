import mongoose from 'mongoose';

const questionSubSchema = new mongoose.Schema({
  prompt:   { type: String },
  answer:   { type: String },
  selected: { type: String },
  correct:  { type: Boolean },
  timeMs:   { type: Number },
}, { _id: false });

const morphologySessionSchema = new mongoose.Schema({
  username:       { type: String, required: true, index: true },
  difficulty:     { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  gameMode:       { type: String, default: 'mixed' }, // identify_affix, build_word, find_meaning, mixed
  score:          { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  accuracy:       { type: Number, default: 0 },       // 0–100
  questions:      [questionSubSchema],
  moodAtStart:    { type: String, default: null },
}, { timestamps: true });

const MorphologySession =
  mongoose.models.MorphologySession ||
  mongoose.model('MorphologySession', morphologySessionSchema);

export default MorphologySession;
