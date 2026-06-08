import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  therapistId: { type: String, required: true }, // 👈 add this line
});

const Child = mongoose.model('Child', childSchema);
export default Child;
