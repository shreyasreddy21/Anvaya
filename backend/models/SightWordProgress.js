import mongoose from 'mongoose';

const sightWordProgressSchema = new mongoose.Schema({
  username:      { type: String, required: true },
  word:          { type: String, required: true },
  list:          { type: String, default: 'dolch' },
  level:         { type: String, default: 'pre-primer' }, // pre-primer, primer, grade1, grade2, grade3
  easeFactor:    { type: Number, default: 2.5 },
  interval:      { type: Number, default: 1 },            // days until next review
  repetitions:   { type: Number, default: 0 },
  nextReview:    { type: Date,   default: Date.now },
  lastReview:    { type: Date,   default: null },
  totalCorrect:  { type: Number, default: 0 },
  totalAttempts: { type: Number, default: 0 },
}, { timestamps: true });

// Compound unique index: one record per (username, word)
sightWordProgressSchema.index({ username: 1, word: 1 }, { unique: true });

const SightWordProgress =
  mongoose.models.SightWordProgress ||
  mongoose.model('SightWordProgress', sightWordProgressSchema);

export default SightWordProgress;
