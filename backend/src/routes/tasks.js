import { Router } from "express";
import { addTask, updateTask, getTasks } from "../controllers/tasksController.js";
import { protect } from "../middleware/authMiddleware.js";
import { role } from "../middleware/roleMiddleware.js";

const router = Router();
router.post("/", protect, role(["manager"]), addTask);
router.put("/:id", protect, role(["manager", "employee"]), updateTask);
router.get("/", protect, getTasks);

export default router;
