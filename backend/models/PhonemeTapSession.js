import mongoose from 'mongoose';

const wordResultSchema = new mongoose.Schema({
  word:             { type: String, required: true },
  expectedPhonemes: { type: Number, required: true },
  actualTaps:       { type: Number, required: true },
  correct:          { type: Boolean, required: true },
  accuracy:         { type: Number, required: true },  // 0–100
}, { _id: false });

const phonemeTapSessionSchema = new mongoose.Schema({
  username:        { type: String, required: true, index: true },
  phonicsLevel:    { type: String, default: null },
  difficulty:      { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  startTime:       { type: Date, required: true },
  endTime:         { type: Date, required: true },
  score:           { type: Number, default: 0 },
  wordResults:     [wordResultSchema],
  overallAccuracy: { type: Number, default: 0 },  // 0–100, average across all words
  moodAtStart:     { type: String, default: null },
}, { timestamps: true });

const PhonemeTapSession =
  mongoose.models.PhonemeTapSession ||
  mongoose.model('PhonemeTapSession', phonemeTapSessionSchema);

export default PhonemeTapSession;
