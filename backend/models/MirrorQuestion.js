import mongoose from 'mongoose';

const mirrorQuestionSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ["Easy", "Medium", "Hard"]
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: (v) => v.length === 4
  },
  correct: {
    type: String,
    required: true
  }
});

const MirrorQuestion = mongoose.model("MirrorQuestion", mirrorQuestionSchema);
export default MirrorQuestion;
