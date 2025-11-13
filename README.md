# PROJ-MERN — Project & Task Management (MERN)

A compact project & task management app built with MongoDB, Express, React (Vite + TypeScript), and Node.js. Designed for team roles (Admin, Manager, Member) with JWT auth, role-based access, and real-time updates via Socket.IO.

---

## Quick links

- Live demo: https://proj-mern-26xk.vercel.app  
- Repo: https://github.com/shubham-singh10/proj-mern

## Table of contents

- Features
- Tech stack
- Folder structure
- Getting started
- Environment
- Development scripts
- Author & license

## Features

- Authentication & Authorization
  - JWT-based registration/login
  - Roles: Member, Manager, Admin
  - Protected routes and role-based guards
- Project & Task Management
  - Create/manage projects
  - Assign employees to projects
  - Create tasks with priority, deadlines and status
- Real-time Collaboration
  - Live task updates and notifications via Socket.IO
- Search & Filters
  - Full-text search and filters by status, priority or assignee
- Admin Panel
  - View and manage users, projects and tasks across the system

## Tech stack

- Frontend: React (Vite + TypeScript), TailwindCSS  
- Backend: Node.js, Express, MongoDB, JWT, bcrypt  
- Realtime: Socket.IO  
- Deployment: Vercel (frontend), AWS EC2 (backend)

## Folder structure

PROJ-MERN/
├── client/ (React + Vite + TS)  
└── backend/ (Node + Express + MongoDB)  
    ├── src/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   └── routes/
    ├── .env.example
    └── index.js

## Getting started (local)

1. Clone
   - git clone https://github.com/shubham-singh10/proj-mern.git
   - cd proj-mern

2. Backend
   - cd backend
   - cd .env.example .env
   - npm install
   - npm run dev (or npm start)

3. Frontend
   - cd ../client
   - npm install
   - npm run dev

Default URLs:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## Environment variables

Create backend/.env with at least:

- PORT=5001
- MONGO_URI=your_mongo_connection_string
- JWT_SECRET=your_secret_key
- CLIENT_URL=your_cleint_url
- NODE_ENV= development  #production for live

## Development scripts

Backend:
- npm run dev — start with nodemon
- npm start — production start

Frontend:
- npm run dev — Vite dev server
- npm run build — build for production

## Notes

- Uses MongoDB Atlas or local MongoDB.
- Ensure CORS and Socket.IO origins match between frontend and backend in development.

## Author

Shubham Kumar Singh  
- Email: shubhamkumarsinghh@outlook.com  
- GitHub: https://github.com/shubham-singh10  
- LinkedIn: https://www.linkedin.com/in/shubham-kumar-singhh/
