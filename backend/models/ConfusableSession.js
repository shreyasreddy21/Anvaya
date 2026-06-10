import mongoose from 'mongoose';

const confusionEventSchema = new mongoose.Schema({
  pair:           String,
  type:           String,
  question:       String,
  selected:       String,
  correct:        Boolean,
  reactionTimeMs: Number,
}, { _id: false });

const confusableSessionSchema = new mongoose.Schema({
  username:        { type: String, required: true, index: true },
  difficulty:      String,
  focusPairs:      [String],
  startTime:       Date,
  endTime:         Date,
  score:           Number,
  events:          [confusionEventSchema],
  overallAccuracy: Number,
  pairAccuracy:    { type: Map, of: Number },
  moodAtStart:     String,
}, { timestamps: true });

export default mongoose.model('ConfusableSession', confusableSessionSchema);
