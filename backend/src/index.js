import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import notifications from './routes/notification.js'
import cookie from 'cookie';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Connect to DB
await connectDB();

// ---------------- Socket.io ----------------
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

// Socket.io middleware for cookie-based auth
io.use((socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) return next(new Error("Authentication error"));

    const parsed = cookie.parse(cookies);
    const token = parsed.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  socket.join(`user_${socket.user.id}`);

  // Join project rooms
  socket.on('joinProject', ({ projectId }) => {
    socket.join(`project_${projectId}`);
  });

  socket.on('leaveProject', ({ projectId }) => {
    socket.leave(`project_${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

app.set('io', io);

// ---------------- Routes ----------------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notifications)

app.get('/', (req, res) => {
  res.send('Hello World!');
});
