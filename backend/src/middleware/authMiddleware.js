import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

export const protect = (req, res, next) => {
    // const authHeader = req.headers?.authorization;
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Not authorized" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // console.log("Decoded Token:", decoded);
        req.user = { id: decoded.id, role: decoded.role }
        next()
    } catch (error) {
        return res.status(401).json({ message: "invalid token" })
    }
}