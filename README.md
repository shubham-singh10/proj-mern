# 💬 MERN App (Assignment)

A full-stack mini web app built with **MongoDB, Express, React (Vite + TypeScript), and Node.js**.  
This project was created as part of the **MERN Stack Developer assignment** .

---

## 🚀 Features

### 👤 Authentication
- JWT-based login and registration.
- Three roles: **Member**, **Admin** and **Manager**.
- Role-based access.

### ❓ Project
- Managers can post new projects.
- add employee to the project.
- create a task of perticular project.
- receive notification project update.

### 💬 Employee
- Employee can update deadline of task.
- Each answer shows author and role (Member/Manager badge).

### 📊 Admin
- They can see all the projects and task

### 🔍 Search & Filtering
- Real-time search by project title.
- Filter system for better user experience.

---

## 🧠 Tech Stack

**Frontend:** React (Vite + TypeScript), TailwindCSS  
**Backend:** Node.js, Express.js, MongoDB, JWT Authentication  
**Database:** MongoDB Atlas (or local MongoDB)  
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
│ │ └── server.ts
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