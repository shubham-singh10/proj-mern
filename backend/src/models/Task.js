import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: String,
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','inprogress','done'], default: 'pending' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  deadline: Date
}, { timestamps: true });

TaskSchema.index({ title: 'text', description: 'text' });

export default mongoose.model("Task", TaskSchema);
