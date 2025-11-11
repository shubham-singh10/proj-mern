import express from 'express'
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import tastRoutes from "./routes/tasks.js";

dotenv.config();


const app = express()
// Connect to MongoDB
await
connectDB();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://qa-app-xi.vercel.app"
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", tastRoutes);

const PORT = process.env.PORT || 50001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});