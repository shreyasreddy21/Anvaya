import mongoose from 'mongoose';

const adaptationLogSchema = new mongoose.Schema({
  username:           { type: String, required: true, index: true },
  gameKey:            { type: String, required: true },
  emotionDetected:    { type: String, default: null },
  previousDifficulty: { type: String, default: null },
  newDifficulty:      { type: String, default: null },
  backgroundChange:   { type: Boolean, default: false },
  triggerType:        { type: String, enum: ['emotion', 'accuracy', 'timeout', 'manual'], default: 'emotion' },
  sessionId:          { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('AdaptationLog', adaptationLogSchema);
