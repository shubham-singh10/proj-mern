import { Router } from "express";
import { createProject, getprojectById, ProjectbyEmployeeId } from "../controllers/projectsController.js";
import { role } from "../middleware/roleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/", protect, role(["manager"]), createProject);
router.put("/:id/employee", protect, role(["manager"]), ProjectbyEmployeeId)
router.get("/:id", getprojectById);

export default router;
