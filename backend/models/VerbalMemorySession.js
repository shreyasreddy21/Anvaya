import mongoose from 'mongoose';

const roundResultSchema = new mongoose.Schema({
  round:            Number,
  sequenceLength:   Number,
  presented:        [String],
  recalled:         [String],
  correct:          Boolean,
  positionAccuracy: Number,   // 0-100 — % of items recalled in the correct position
}, { _id: false });

const verbalMemorySessionSchema = new mongoose.Schema({
  username:           { type: String, required: true, index: true },
  difficulty:         String,
  mode:               { type: String, enum: ['words', 'letters', 'numbers'] },
  startTime:          Date,
  endTime:            Date,
  rounds:             [roundResultSchema],
  maxSequenceLength:  Number,   // peak sequence length achieved this session
  overallAccuracy:    Number,   // mean positionAccuracy across rounds (0-100)
  workingMemoryScore: Number,   // maxSequenceLength × (overallAccuracy/100) × 10
  moodAtStart:        String,
}, { timestamps: true });

export default mongoose.model('VerbalMemorySession', verbalMemorySessionSchema);
