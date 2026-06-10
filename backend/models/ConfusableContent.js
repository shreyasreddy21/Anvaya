import mongoose from 'mongoose';

const confusableContentSchema = new mongoose.Schema({
  pair:       { type: String, required: true, enum: ['bd', 'pq', 'mw', 'nu'] },
  type:       { type: String, required: true, enum: ['letter_id', 'word_context'] },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  question:   { type: String, required: true },
  options:    { type: [String], required: true },
  correct:    { type: String, required: true },
  hint:       { type: String, default: '' },
});

confusableContentSchema.index({ pair: 1, type: 1, difficulty: 1 });

export default mongoose.model('ConfusableContent', confusableContentSchema);
