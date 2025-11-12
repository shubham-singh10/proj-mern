import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['taskUpdated', 'taskCreated', 'employeeAdded'],
        default: 'taskUpdated'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });


export default mongoose.model("Notification", NotificationSchema);