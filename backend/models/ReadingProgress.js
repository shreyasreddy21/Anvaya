import mongoose from 'mongoose';

export const READING_LEVELS = ['pre-reader', 'CVC', 'Blends', 'Digraphs', 'VowelPatterns'];

const levelHistorySchema = new mongoose.Schema({
  fromLevel:  { type: String },
  toLevel:    { type: String, required: true },
  advancedAt: { type: Date, default: Date.now },
  advancedBy: { type: String, enum: ['auto', 'therapist'], default: 'auto' },
  note:       { type: String, default: '' },
}, { _id: false });

const readingProgressSchema = new mongoose.Schema({
  childUsername:     { type: String, required: true, unique: true },
  currentLevel:      { type: String, enum: READING_LEVELS, default: 'pre-reader' },
  levelHistory:      [levelHistorySchema],
  therapistOverride: { type: Boolean, default: false },
  overriddenBy:      { type: String, default: null },
  lastChecked:       { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('ReadingProgress', readingProgressSchema);
