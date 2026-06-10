import mongoose from 'mongoose';

const ranItemSchema = new mongoose.Schema({
  item:     String,
  selected: String,
  correct:  Boolean,
  timeMs:   Number,
}, { _id: false });

const ranSessionSchema = new mongoose.Schema({
  username:       { type: String, required: true, index: true },
  category:       { type: String, enum: ['letters', 'numbers', 'colors'], required: true },
  difficulty:     String,
  startTime:      Date,
  endTime:        Date,
  totalTimeMs:    Number,
  itemsPerMinute: Number,
  totalItems:     Number,
  correctItems:   Number,
  accuracy:       Number,
  items:          [ranItemSchema],
  moodAtStart:    String,
}, { timestamps: true });

export default mongoose.model('RANSession', ranSessionSchema);
