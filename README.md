# 🖥️ OSLab — Interactive Operating System Learning & Virtual Laboratory

[![Frontend: React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Build Tool: Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Backend: Express](https://img.shields.io/badge/Backend-Express.js%20%2B%20TypeScript-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Frontend Deployment: Vercel](https://img.shields.io/badge/Deploy%20Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Backend Deployment: Render](https://img.shields.io/badge/Deploy%20Backend-Render-46E3B7?logo=render&logoColor=white)](https://render.com/)

An interactive, full-stack educational platform and virtual operating system laboratory. **OSLab** bridges theoretical OS concepts with hands-on algorithm visualization, virtual machine simulation, and assessment tracking.

---

## 🌟 Key Features

### 1. 📖 OS Learn Module
- Structured theoretical guides covering **Process Management, Memory Hierarchy, Storage, CPU Scheduling, Deadlocks, and File Systems**.
- Visual diagrams, code snippets, and interactive key-takeaway summaries.

### 2. 💻 Mini-OS Virtual Runtime
- **Interactive Shell / Terminal**: Execute simulated commands (`ps`, `kill`, `touch`, `rm`, `ls`, `mem`, `cat`, `help`).
- **Process Manager**: Real-time process creation, state transitions (Ready, Running, Blocked, Terminated), and PID tracking.
- **Virtual Memory Inspector**: Real-time memory allocation map and fragmentation viewer.
- **Virtual File System (VFS)**: Hierarchical folder and file creation, deletion, and content inspection.

### 3. 🔬 OS Lab & Algorithm Visualizers
- **CPU Scheduling**: First-Come-First-Serve (FCFS), Shortest Job First (SJF Non-Preemptive & Preemptive / SRTF), Priority (Preemptive & Non-Preemptive), and Round Robin (RR) with dynamic Gantt charts and turnaround/waiting time calculators.
- **Memory Allocation**: First Fit, Best Fit, and Worst Fit dynamic partition visualizers.
- **Page Replacement**: FIFO, LRU (Least Recently Used), and Optimal page replacement algorithms with hit/fault step-by-step tables.
- **Disk Scheduling**: FCFS, SSTF, SCAN (Elevator), C-SCAN, LOOK, and C-LOOK seek sequence animations.

### 4. 📝 Quizzes & Progress Analytics
- Instant assessment quizzes per topic with immediate score calculation and review.
- User profile dashboard tracking completed modules, quiz mastery, and saved laboratory experiments.

### 5. 🔒 Security & Data Persistence
- Stateless JWT authentication with `bcryptjs` password hashing.
- MongoDB persistence for user profiles, custom experiments, learning progress, and quiz history.

---

## 🏗️ Repository Architecture

The project is organized as a production-ready monorepo separating client and server concerns:

```
OSLab/
├── backend/                  # Express + TypeScript API Server
│   ├── src/
│   │   ├── config/           # Database and environment configurations
│   │   ├── features/         # Modular feature domain handlers
│   │   │   ├── auth/         # JWT authentication & registration
│   │   │   ├── user/         # Profile management
│   │   │   ├── experiment/   # Experiment save/load API
│   │   │   ├── progress/     # Topic completion tracking
│   │   │   ├── quiz/         # Assessment questions & submissions
│   │   │   ├── simulation/   # CPU, Memory, & Disk scheduling engines
│   │   │   ├── dashboard/    # Aggregated analytics
│   │   │   ├── mini-os/      # Mini OS runtime state persistence
│   │   │   └── health/       # Health diagnostic endpoint
│   │   ├── middleware/       # JWT auth, error handlers, rate limiters
│   │   ├── app.ts            # Express application setup
│   │   └── server.ts         # Server bootstrap & graceful shutdown
│   ├── .env.example          # Backend environment template
│   ├── package.json          # Backend dependencies & build scripts
│   └── tsconfig.json         # Backend TypeScript config
│
├── frontend/                 # React 19 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── algorithms/       # Client-side OS algorithm math & simulators
│   │   ├── components/       # Shared UI widgets (Navbar, Footer, Modal, etc.)
│   │   ├── features/         # Route views (Auth, Learn, MiniOS, OSLab, Quizzes)
│   │   ├── services/         # Axios API client with auth interceptor
│   │   ├── stores/           # Zustand state management stores
│   │   ├── styles/           # CSS modules and theme stylesheets
│   │   ├── App.tsx           # React router definitions
│   │   └── main.tsx          # Client entry point
│   ├── vercel.json           # Vercel SPA routing rewrite rules
│   ├── .env.example          # Frontend environment template
│   ├── package.json          # Frontend dependencies & build scripts
│   └── vite.config.ts        # Vite build & local proxy configuration
│
├── render.yaml               # Render Blueprint for automated backend deployment
├── package.json              # Monorepo root helper scripts
├── .gitignore                # Global ignore rules
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

---

### Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

#### Backend (`backend/.env`):
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/oslab
JWT_SECRET=your_super_secret_jwt_key_for_development
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`):
Create `frontend/.env` based on `frontend/.env.example`:
```env
# Optional during local development (defaults to local Vite proxy /api)
VITE_API_URL=http://localhost:5000
```

---

### Step 3: Run the Development Servers

Open two terminal windows:

#### Terminal 1 — Backend:
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

#### Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
# Vite dev server starts on http://localhost:5173
```

---

## 🌐 Production Deployment Guide

### Part 1: Deploy Backend to [Render](https://render.com)

1. **Sign in** to [Render](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. **Connect your GitHub repository**.
3. Configure the Web Service settings:
   - **Name**: `oslab-backend` (or your preferred name)
   - **Region**: Select the region closest to you
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
4. Add **Environment Variables** in Render Dashboard:
   | Key | Value | Description |
   | --- | --- | --- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Render injects this automatically or uses 5000 |
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/oslab?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `A_STRONG_RANDOM_SECRET_KEY_MIN_32_CHARS` | Secure key for signing JWTs |
   | `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` | Your Vercel frontend URL |
5. Click **Create Web Service**.
6. Once deployed, copy your Render Service URL (e.g., `https://oslab-backend.onrender.com`).
7. Verify health by visiting `https://oslab-backend.onrender.com/api/health` in your browser.

---

### Part 2: Deploy Frontend to [Vercel](https://vercel.com)

1. **Sign in** to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
2. **Import your GitHub repository**.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and choose `frontend`
   - **Build Command**: `npm run build` (or leave default `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and add:
   | Name | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://oslab-backend.onrender.com` (Your Render backend URL) |
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g., `https://oslab.vercel.app`) and update the `FRONTEND_URL` environment variable in your **Render** backend settings so CORS allows requests.

---

## 📤 Pushing to GitHub (Step-by-Step)

If you haven'\''t initialized git in this directory yet, follow these steps:

```bash
# 1. Initialize git repository
git init

# 2. Stage all files (git ignore will automatically skip node_modules, dist, and .env)
git add .

# 3. Create your initial commit
git commit -m "feat: initial commit with restructured Vercel and Render ready architecture"

# 4. Rename default branch to main
git branch -M main

# 5. Add your GitHub repository remote
# (Replace with your actual GitHub repository URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Service health status & DB connectivity | No |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/simulations/cpu` | Run CPU scheduling simulation | No / Optional |
| `POST` | `/api/simulations/memory` | Run Memory allocation simulation | No / Optional |
| `POST` | `/api/simulations/page-replacement` | Run Page replacement simulation | No / Optional |
| `POST` | `/api/simulations/disk` | Run Disk scheduling simulation | No / Optional |
| `GET` | `/api/experiments` | List saved user experiments | Yes |
| `POST` | `/api/experiments` | Save a new experiment | Yes |
| `GET` | `/api/progress` | Fetch user completion progress | Yes |
| `POST` | `/api/progress` | Record topic/lab completion | Yes |
| `GET` | `/api/quizzes/:topicId` | Fetch assessment quiz questions | Yes |
| `POST` | `/api/quizzes/:topicId/submit` | Submit quiz answers & get score | Yes |
| `GET` | `/api/dashboard` | Aggregated dashboard stats & metrics | Yes |
| `GET` | `/api/mini-os/state` | Fetch saved Mini-OS virtual filesystem & state | Yes |
| `POST` | `/api/mini-os/state` | Persist Mini-OS virtual machine state | Yes |

For full endpoint request schemas and sample responses, see [`backend/API.md`](backend/API.md).

---

## 🛠️ Scripts Reference

### Root Directory
- `npm run dev:frontend` — Start Vite frontend dev server.
- `npm run dev:backend` — Start Express backend with tsx watcher.
- `npm run build:frontend` — Build frontend production bundle (`dist/`).
- `npm run build:backend` — Compile backend TypeScript (`dist/`).
- `npm run install:all` — Install dependencies in both frontend and backend.

### Backend (`cd backend`)
- `npm run dev` — Watch mode execution via tsx.
- `npm run build` — TypeScript compiler build.
- `npm run start` — Production server start.
- `npm run seed:quizzes` — Seed default OS quiz assessment questions.
- `npm run test` — Run backend integration and unit test suite.

### Frontend (`cd frontend`)
- `npm run dev` — Start Vite development server.
- `npm run build` — Build production bundle.
- `npm run preview` — Locally preview production build.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
