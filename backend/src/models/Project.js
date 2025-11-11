import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    title: String,
    description: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

ProjectSchema.index({ title: 'text', description: 'text' });

export default mongoose.model("Project", ProjectSchema);