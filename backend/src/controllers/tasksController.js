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
    const update = req.body;
    try {
        const task = await Task.findById(id)
        if (!task) return res.status(404).json({ status: false, message: "Task not found" })
        if (req.user.role === "employee" && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ status: false, message: "Access denied only for assigned employee" })
        }
        Object.assign(task, update)
        await task.save()
        res.status(200).json({ status: true, task })

    } catch (error) {
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

        const tasks = await Task.find(query).limit(100).sort({ createdAt: -1 });
        res.status(200).json({ status: true, tasks })

    } catch (error) {
        res.status(400).json({ status: false, message: "something went wrong" })
    }
}