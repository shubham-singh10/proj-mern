import Project from "../models/Project.js";

// API to create a project
export const createProject = async (req, res) => {
    const { title, description } = req.body;

    try {
        // create a ques.
        const project = await Project.create({
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

// API to update a project to emoployee
export const ProjectbyEmployeeId = async (req, res) => {
    const { id } = req.params;
    const { employeeId } = req.body;

    try {
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: false,
                message: "Invalid project ID"
            });
        }

        const project = await Project.findById(id)
        if(!project) return res.status(404).json({ status: false, message: "Project not found" })
        if (project.manager.toString() !== req.user.id) return res.status(403).json({ status: false, message: "Access denied only for manager" })
        
        project.employees.push(employeeId)
        await project.save()
       
        return res.status(201).json({ status: true, project })
    } catch (error) {
        return res.status(400).json({ status: false, message: "something went wrong" })
    }
}