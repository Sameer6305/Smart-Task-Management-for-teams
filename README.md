# 🚀 TaskFlow Pro

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg?logo=postgresql)
![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg?logo=express)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)

---

## 1. 📖 Project Overview

**TaskFlow Pro** is an intuitive, robust, and modern task management application built for modern teams. 

**The Problem It Solves:** Teams often struggle to maintain visibility over tasks, assign priorities, and easily update statuses across different departments without bloated corporate software. TaskFlow Pro offers a smooth, snappy environment to track, manage, and filter task lifecycles effectively in a centralized dashboard.

**Key Features:**
* 🔐 Secure JWT Authentication
* 📊 Statistical User Dashboards
* 📝 Full CRUD Capabilities for Tasks
* 🎨 Modern Glassmorphism/Tailwind UI
* 🔒 Role-Based Authorization

---

## 2. 💻 Tech Stack

### ⚡ **Frontend**
* **React 18** – UI Library
* **Vite** – Fast build tool
* **Tailwind CSS** – Utility-first CSS styling
* **Axios** – Promise-based HTTP client

### ⚙️ **Backend**
* **Node.js** – JavaScript runtime environment
* **Express.js (v5.2.1)** – Web application framework
* **PostgreSQL (pg)** – Relational database
* **JWT (jsonwebtoken)** – Secure authentications
* **Bcryptjs** – Password hashing

---

## 3. 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

* **Node.js**: `v18.x` or higher
* **npm** or **yarn**: `v9.x+` (NPM) or `v1.22+` (Yarn)
* **PostgreSQL**: `v13.x` or higher installed and running locally.

---

## 4. 📦 Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/Sameer6305/Smart-Task-Management-for-teams.git
cd taskflow-pro
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

### Step 4: Database Setup
1. Log into your PostgreSQL instance:
   ```bash
   psql -U postgres
   ```
2. Create the Database:
   ```sql
   CREATE DATABASE taskflow_db;
   \c taskflow_db;
   ```
3. Run the raw SQL Schema provided to set up the Enum types, Users table, and Tasks table:
   ```bash
   psql -U postgres -d taskflow_db -f database.sql
   ```

### Step 5: Environment Variables Setup

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. 🏃 Running the Application

Open **two** terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

* **Frontend GUI:** `http://localhost:5173`
* **Backend API Base:** `http://localhost:5000`

---

## 6. 📚 API Documentation

### 🛡️ Authentication Endpoints

| Method | Endpoint             | Description              | Auth Required |
|--------|----------------------|--------------------------|---------------|
| `POST` | `/api/auth/register` | Register new user        | ❌ No         |
| `POST` | `/api/auth/login`    | Authenticate user        | ❌ No         |
| `GET`  | `/api/auth/profile`  | Fetch authenticated user | ✅ Yes        |

#### Request Example (Login):
```json
// POST /api/auth/login
{
  "email": "user@taskflow.local",
  "password": "SecurePassword123!"
}
```

### ✅ Task Endpoints

| Method   | Endpoint             | Description             | Auth Required |
|----------|----------------------|-------------------------|---------------|
| `POST`   | `/api/tasks`         | Create a task           | ✅ Yes        |
| `GET`    | `/api/tasks`         | Fetch paginated tasks   | ✅ Yes        |
| `GET`    | `/api/tasks/:id`     | Fetch specific task     | ✅ Yes        |
| `PUT`    | `/api/tasks/:id`     | Update task             | ✅ Yes        |
| `DELETE` | `/api/tasks/:id`     | Delete task             | ✅ Yes        |
| `GET`    | `/api/tasks/statistics` | Dashboard summaries | ✅ Yes        |

#### Request Example (Create Task):
```json
// POST /api/tasks
{
  "title": "Finalize Q3 Roadmaps",
  "description": "Establish objectives and meet with PMs.",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-10-15T00:00:00Z"
}
```

---

## 7. ⭐ Features

- **User Authentication:** Fully secured credential and JWT-driven routing mechanisms.
- **Role-Based Access:** Differential protections on actions (e.g. distinct Admin privileges over team routing).
- **Task CRUD:** Extensive Create, Read, Update, and Delete options safely mapped around User contexts.
- **Filters and Search:** Backend filter pipeline endpoints capable of filtering dynamically by status and priorities.
- **Statistics Dashboard:** Built-in SQL aggregation pipelines querying current pending vs in-progress vs completed datasets on the fly. 

---

## 8. 🔒 Security Features

- **JWT Auth Checks:** Secure Bearer intercepts enforcing expiration schemas globally via middleware.
- **Password Hashing:** `bcryptjs` injection guaranteeing transparent security for local table accounts.
- **Input Validation:** Enforced payload formatting directly managed via `express-validator` middleware.
- **Rate Limiting:** `express-rate-limit` configuration rejecting volumetric API abuse instantly.
- **CORS Mitigation:** Hardened routing origins accepting exclusively mapped internal URLs.
- **Helmet HTTP Buffers:** Injecting secured browser navigation parameters against client attacks.

---

## 9. 📁 Project Structure

```text
taskflow-pro/
├── backend/
│   ├── src/
│   │   ├── config/      # DB configurations and environmental binds
│   │   ├── controllers/ # Request handler abstractions
│   │   ├── middleware/  # JWT & Input Validators
│   │   ├── models/      # PostgreSQL Raw Class Bindings
│   │   ├── routes/      # Endpoints
│   │   ├── server.js    # Entry Point & Express Application Settings
│   ├── .env
│   ├── package.json
│   └── database.sql
└── frontend/
    ├── src/
    │   ├── assets/      
    │   ├── components/  # Isolated UI JSX structures
    │   ├── pages/       # Next.js-style folder pages 
    │   ├── services/    # Complete Axios API configuration bridge
    │   ├── App.jsx      # Core React implementation
    │   └── main.jsx
    ├── tailwind.config.js
    ├── index.html
    └── package.json
```

---

## 10. 📸 Screenshots

| Login Page | Application Dashboard | Task Modal Creation |
| :---: | :---: | :---: |
| ![Login Placeholder](https://via.placeholder.com/400x250.png?text=Secure+Login) | ![Dashboard Placeholder](https://via.placeholder.com/400x250.png?text=Task+Statistics+Dashboard) | ![Modal Placeholder](https://via.placeholder.com/400x250.png?text=Clean+Task+Insertion+Modal) |

---

## 11. 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Link your GitHub Repository.
2. Select **Web Service** on Node.
3. Inject the Render/Railway URL generated dynamically for your PostgreSQL (Neon) Database as the `DATABASE_URL`.
4. Define your `JWT_SECRET`, `JWT_EXPIRE`, and set `NODE_ENV=production`.
5. Run Start Command: `npm run start`

### Frontend Deployment (Vercel)
1. Add a New Project picking `taskflow-pro/frontend` directory.
2. Vercel automatically flags Vite build outputs.
3. Inject the Environment Variable: `VITE_API_URL` aligning precisely to your Render backend endpoint.
4. Deploy and automatically link domain headers!

---

## 12. 🔮 Future Enhancements

- [ ] **Real-time Updates:** Push live notifications matching completed tasks from specific workspaces utilizing `socket.io`.
- [ ] **File Attachments:** AWS S3 object linkages mapping individual tickets to uploaded resources globally.
- [ ] **Email Notifications:** Cron pipelines combined via SendGrid confirming team members have pending overdue statuses.
- [ ] **Dark Mode Toggle:** Inject comprehensive Tailwind class mapping responding fully natively to user preferences.

---

## 13. 🤝 Contributing

We welcome contributions to **TaskFlow Pro**. Please keep everything streamlined:
1. **Fork** the repository and create your feature branch: `git checkout -b feature/my-new-feature`
2. **Commit** your changes logically: `git commit -am 'Add some feature'`
3. **Push** strictly relative to your branch: `git push origin feature/my-new-feature`
4. Open a **Pull Request**.

---

## 14. ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for more information.
