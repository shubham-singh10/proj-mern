import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

// API to create task
export const addTask = async (req, res) => {
    const { projectId, title, description, assignedTo, priority, deadline } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ status: false, message: "Project not found" });
        }
        if (project.manager.toString() !== req.user.id) {
            return res.status(403).json({ status: false, message: "Access denied only for manager" });
        }
        const task = await Task.create({
            project: projectId,
            title,
            description,
            assignedTo,
            priority,
            deadline
        });
        await task.save();
        res.status(201).json({ status: true, task })
    } catch (error) {
        res.status(400).json({ status: false, message: "something went wrong" })
    }
}

// API to update task role
export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { status, deadline } = req.body;
    try {
        const task = await Task.findById(id)
        if (!task) return res.status(404).json({ status: false, message: "Task not found" })
        if (req.user.role === "employee" && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ status: false, message: "Access denied only for assigned employee" })
        }
        const update = {};
        if (status) update.status = "pending" ? "inprogress" : status;
        if (deadline) update.deadline = deadline;
        Object.assign(task, update)
        await task.save()

        const project = await Project.findById(task.project).populate('manager', '_id name email').populate('employees', '_id name email');

        const usertoNotify = [project.manager._id]
        project.employees.forEach(emp => {
            if (emp._id.toString() !== req.user.id) {
                usertoNotify.push(emp._id)
            }
        });

        await Notification.create(
            usertoNotify.map(userId => ({
                userId,
                projectId: task.project,
                taskId: task._id,
                message: `Task "${task.title}" status updated and deadline changed to ${deadline}`,
                type: 'taskUpdated',
                data: { task, updatedBy: req.user.name }
            }))
        );

        const io = req.app.get('io');
        const managerId = project.manager._id.toString();
        io.to(`user_${managerId}`).emit('taskUpdated', {
            task
        });
        res.status(200).json({ status: true, task })

    } catch (error) {
        console.error(error);
        res.status(400).json({ status: false, message: "something went wrong" })
    }
}

// API to get tasks
export const getTasks = async (req, res) => {
    const { search, status, priority, assignedTo } = req.query;
    try {
        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (search) query.$text = { $search: search };

        const tasks = await Task.find(query).populate("assignedTo", "_id name email").limit(100).sort({ createdAt: -1 });
        res.status(200).json({ status: true, tasks })

    } catch (error) {
        res.status(400).json({ status: false, message: "something went wrong" })
    }
}

//API tp get task employee wise
export const getTasksByEmployee = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id }).populate("project", "_id title").limit(100).sort({ createdAt: -1 });
        res.status(200).json({ status: true, tasks })

    } catch (error) {
        res.status(400).json({ status: false, message: "something went wrong" })
    }
}