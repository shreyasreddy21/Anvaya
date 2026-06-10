import mongoose from 'mongoose';

const questionResultSchema = new mongoose.Schema({
  letter:         { type: String, required: true },
  selectedOption: { type: String, required: true },
  correct:        { type: Boolean, required: true },
  reactionTimeMs: { type: Number, required: true },
}, { _id: false });

const letterSoundSessionSchema = new mongoose.Schema({
  username:          { type: String, required: true, index: true },
  phonicsLevel:      { type: String, default: null },
  difficulty:        { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  startTime:         { type: Date, required: true },
  endTime:           { type: Date, required: true },
  score:             { type: Number, default: 0 },
  questionResults:   [questionResultSchema],
  overallAccuracy:   { type: Number, default: 0 },   // 0–100
  avgReactionTimeMs: { type: Number, default: 0 },
  moodAtStart:       { type: String, default: null },
}, { timestamps: true });

const LetterSoundSession =
  mongoose.models.LetterSoundSession ||
  mongoose.model('LetterSoundSession', letterSoundSessionSchema);

export default LetterSoundSession;
