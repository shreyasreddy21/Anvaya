import mongoose from 'mongoose';

const PHONICS_LEVELS     = ['CVC', 'Blends', 'Digraphs', 'VowelPatterns', 'AdvancedPatterns'];
const GAME_TYPES         = ['letter_bridge', 'word_puzzle', 'syllable_tap', 'mirror_words', 'phoneme_tap', 'letter_sound'];
const DIFFICULTIES       = ['easy', 'medium', 'hard'];

const phonicsContentSchema = new mongoose.Schema({
  level:      { type: String, enum: PHONICS_LEVELS, required: true, index: true },
  gameType:   { type: String, enum: GAME_TYPES,     required: true, index: true },
  difficulty: { type: String, enum: DIFFICULTIES,   default: 'easy' },

  // word_puzzle
  word:  String,
  image: { type: String, default: '' },
  hint:  String,

  // syllable_tap (also uses word field above)
  syllables: Number,
  split:     [String],

  // letter_bridge — jagged 2D array stored as Mixed
  letters:    { type: mongoose.Schema.Types.Mixed },
  validWords: [String],

  // mirror_words
  question: String,
  options:  [String],
  correct:  String,
}, { timestamps: true });

phonicsContentSchema.index({ level: 1, gameType: 1, difficulty: 1 });

const PhonicsContent =
  mongoose.models.PhonicsContent ||
  mongoose.model('PhonicsContent', phonicsContentSchema);

export default PhonicsContent;
