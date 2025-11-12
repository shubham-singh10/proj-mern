import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { role } from "../middleware/roleMiddleware.js";
import { deleteNotification, getNotifications, markAllAsRead, markAsRead } from "../controllers/notificationController.js";

const router = Router();
router.get("/", protect, role(["manager"]), getNotifications);
router.put('/:id/read', protect, role(["manager"]), markAsRead);
router.put('/mark-all-read', protect, role(["manager"]), markAllAsRead);
router.delete('/:id', protect, role(["manager"]), deleteNotification);
export default router;
