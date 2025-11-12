import Project from "../models/Project.js";
import Task from "../models/Task.js";

// API to create a project
export const createProject = async (req, res) => {
    const { title, description } = req.body;

    try {

        const project = await Project.findOne({ title });
        if (project) {
            return res.status(400).json({ status: false, message: "Project with this title already exists." });
        }
        // create a project.
        await Project.create({
            title,
            description,
            manager: req.user.id
        })
        await project.save()
        return res.status(201).json({ status: true, project })
    } catch (error) {
        return res.status(400).json({ status: false, message: "something went wrong." })
    }
}

// API to get a project with id
export const getprojectById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: false,
                message: "Invalid project ID"
            });
        }
        const project = await Project.findById(id).populate('employees', 'name email').sort({ createdAt: -1 })
        if (!project) {
            return res.status(404).json({
                status: false,
                message: "Project not found"
            });
        }
        return res.status(200).json({ status: true, project })
    } catch (error) {
        return res.status(400).json({ status: false, message: "something went wrong" })
    }
}

// API to get a project
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("employees", "_id name email")
            .populate("manager", "_id name email")
            .sort({ createdAt: -1 })

        const projectsWithTasks = await Promise.all(
            projects.map(async (project) => {
                const tasks = await Task.find({ project: project._id })
                    .populate('assignedTo', 'name email');

                return {
                    ...project.toObject(),
                    tasks
                };
            })
        );
        return res.status(200).json({ status: true, projects: projectsWithTasks })
    } catch (error) {
        return res.status(400).json({ status: false, message: "something went wrong" })
    }
}

// API to get projects by manager
export const getProjectsbyManager = async (req, res) => {
    try {
        const projects = await Project.find({ manager: req.user.id }).populate("employees", "_id name email").sort({ createdAt: -1 })
        return res.status(200).json({ status: true, projects })
    } catch (error) {
        console.error("Error fetching projects by manager:", error);
        return res.status(400).json({ status: false, message: "something went wrong" })
    }
}

// API to update a project to emoployee
export const ProjectbyEmployeeId = async (req, res) => {
    const { id } = req.params;
    const { employeeId } = req.body;
    console.log("Employee ID to add:", employeeId);
    console.log("Project ID:", id);
    try {
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: false,
                message: "Invalid project ID"
            });
        }

        const project = await Project.findById(id)
        if (!project) return res.status(404).json({ status: false, message: "Project not found" })
        if (project.manager.toString() !== req.user.id) return res.status(403).json({ status: false, message: "Access denied only for manager" })

        project.employees.push(employeeId)
        await project.save()

        return res.status(201).json({ status: true, project })
    } catch (error) {
        return res.status(400).json({ status: false, message: "something went wrong" })
    }
}