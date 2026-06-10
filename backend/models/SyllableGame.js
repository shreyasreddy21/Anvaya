import mongoose from 'mongoose';

const PHONICS_LEVELS = ['CVC', 'Blends', 'Digraphs', 'VowelPatterns', 'AdvancedPatterns'];

const syllableGameSchema = new mongoose.Schema({
  word:         String,
  syllables:    Number,
  split:        [String],
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'] },
  phonicsLevel: { type: String, enum: PHONICS_LEVELS, default: null },
});

const SyllableGame = mongoose.model('SyllableGame', syllableGameSchema);
export default SyllableGame;
