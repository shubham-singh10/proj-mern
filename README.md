# 💬 MERN Project & Task Management App

A full-stack mini web app built with **MongoDB, Express, React (Vite + TypeScript), and Node.js**.  
This project was created as part of the **MERN Stack Developer assignment** .

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based login and registration.
- Three roles: **Member**, **Admin** and **Manager**.
- Role-based access.
- Protected routes with token validation.

### 📁 Project Management
. Managers can:
    - Create and manage projects.
    - Add employees to specific projects.
    - Assign tasks with deadlines and priorities.
    - Receive real-time notifications on task updates.

👨‍💻 Employee Portal
    - View assigned tasks.
    - Update task status and deadlines.
    - Trigger real-time updates to the manager dashboard.

🧩 Admin Panel
    - View all projects, tasks, and user details.
    - Monitor overall activity across managers and employees.

🔍 Search & Filters
    - Full-text search by project or task title.
    - Filter by status, priority, or assigned user for faster navigation.

🔥 Real-Time Collaboration
    - Implemented using Socket.IO for live task updates and manager notifications.

---

## 🧠 Tech Stack

**Frontend:** React (Vite + TypeScript), TailwindCSS  
**Backend:** Node.js, Express.js, MongoDB, JWT Authentication  
**Database:** MongoDB Atlas (or local MongoDB)  
**Auth:**     JWT + bcrypt
**Deployment:** Vercel (Frontend) + AWS EC2 (Backend)

---

## 📦 Folder Structure

PROJ-MERN/
├── client/ # React + Vite + TypeScript app
│ └── src/
│ ├── components/
│ └── api/
├── backend/ # Node.js + Express + MongoDB API
│ ├── src/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ └── index.js
|-- .gitignore
└── README.md

---

## ⚙️ Setup Instructions

### 1️.-->  Clone the Repository
- git clone https://github.com/shubham-singh10/proj-mern.git
- cd PROJ-MERN

### 2.-->  Backend Setup
- cd backend
- .env   # create your own .env file
- npm install
- npm run dev | npm start

 ###### Example .env ##########

- PORT=5000
- MONGO_URI=your_mongo_connection_string
- JWT_SECRET=your_secret_key


### 3.-->  Frontend Setup

- cd ./client
- npm install
- npm run dev


### 4. ---> Access the app
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001


### 🌐 Live Demo

- Frontend (React): https://proj-mern-26xk.vercel.app

### 👨‍💻 Author

**Shubham Kumar Singh**
- 📧 shubhamkumarsinghh@outlook.com
- 🔗 [LinkedIn](https://www.linkedin.com/in/shubham~kumar~singh/)
- 💻 [GitHub](https://github.com/shubham-singh10)