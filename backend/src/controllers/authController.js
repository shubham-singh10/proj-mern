import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import User from "../models/User.js";
dotenv.config()

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

//API to create a new user
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ status: false, message: "Email already registered." })

        //Create a new user
        const user = await User.create({ name, email, password, role })

        const userToken = {
            _id: user._id,
            role: user.role,
        };

        const token = signToken(userToken);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({ status: true, user: { role: user.role } })
    } catch (error) {
        res.json(400).json({ status: false, message: "something went wrong" })
    }
}

// API for login
export const login = async (req, res) => {
    const { email, password } = req.body
    // console.log(req.body)
    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ status: false, message: "Invalid credentials" })

        //Check Password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(400).json({ status: false, message: "Invalid Password" })

        const userToken = {
            _id: user._id,
            role: user.role,
        };
        const token = signToken(userToken);
        res.cookie("token", token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            secure : false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ status: true, user: { role: user.role } })
    } catch (error) {
        res.json(400).json({ status: false, message: "something went wrong" })
    }
}

// API to get a employe 
export const getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: "employee" }).select("-password").sort({ createdAt: -1 })
        res.status(200).json({ status: true, employees })
    } catch (error) {
        res.status(400).json({ status: false, message: "something went wrong" })
    }
}