import mongoose from 'mongoose';

const errorSubSchema = new mongoose.Schema({
  wordIndex:  { type: Number },
  word:       { type: String },
  recognized: { type: String },
}, { _id: false });

const fluencySessionSchema = new mongoose.Schema({
  username:     { type: String, required: true, index: true },
  passageId:    { type: String, required: true },
  passageTitle: { type: String, default: '' },
  wordCount:    { type: Number, default: 0 },
  timeSeconds:  { type: Number, default: 0 },
  wpm:          { type: Number, default: 0 },
  accuracy:     { type: Number, default: 0 },   // 0–100 percent
  errors:       [errorSubSchema],
  moodAtStart:  { type: String, default: null },
}, { timestamps: true });

const FluencySession =
  mongoose.models.FluencySession ||
  mongoose.model('FluencySession', fluencySessionSchema);

export default FluencySession;
