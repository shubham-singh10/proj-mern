import { Router } from "express";
import { getEmployees, login, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/employees", getEmployees)
router.get("/me", protect, (req, res)=>{
    res.json({
        id: req.user.id,
        role: req.user.role
    })
});
router.post("/logout", protect, (req, res)=>{
    res.clearCookie("token");
    res.json({ status: true, message: "Logged out successfully" });
});

export default router