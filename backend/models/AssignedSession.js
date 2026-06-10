import mongoose from 'mongoose';

const gameAssignmentSchema = new mongoose.Schema({
  gameKey:     { type: String, required: true },
  order:       { type: Number, required: true },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  durationMin: { type: Number, default: 10 },
}, { _id: false });

const assignedSessionSchema = new mongoose.Schema({
  therapistId:   { type: String, required: true, index: true },
  childUsername: { type: String, required: true, index: true },
  date:          { type: String, required: true },   // YYYY-MM-DD
  games:         [gameAssignmentSchema],
  instructions:  { type: String, default: '' },
  completed:     { type: Boolean, default: false },
  completedAt:   { type: Date, default: null },
}, { timestamps: true });

assignedSessionSchema.index({ childUsername: 1, date: 1 });

export default mongoose.model('AssignedSession', assignedSessionSchema);
