import mongoose from 'mongoose';

const syllableGameSchema = new mongoose.Schema({
  word: String,
  syllables: Number,
  split: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
  }
});

const SyllableGame = mongoose.model('SyllableGame', syllableGameSchema);
export default SyllableGame;
