# Vel Tech University - Hostel Complaint Management System
**Course:** 10214CS601 - Minor Project - I (Academic Year 2026-2027)  
**Department:** Department of Computer Science & Engineering, School of Computing  
**Institution:** Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology (Deemed to be University), Avadi, Chennai  

---

### Project Team & Supervisor
- **Student 1:** K. Siddarth Patel (`VTU28319` / `24UECS1237`)
- **Student 2:** Ramsetty Sreevasthav (`VTU28844` / `24UECS1353`)
- **Student 3:** A. Rakesh (`VTU27728` / `24UECS1121`)
- **Supervisor:** Dr. S. Manohar, B.Sc, M.Sc, M.E, PhD (CSE), Chief Hostel Warden

---

## 🏗️ Architecture Overview

The system is built as a production-grade, multi-tier web application adhering to official campus administrative workflows:

1. **Presentation Layer (`frontend/`)**:
   - Modern React 18 with TypeScript and Vite.
   - Professional Institutional UI with official Vel Tech branding (Maroon `#600000`, white cards, clean typography).
   - **Dedicated, Separate Login Pages** for:
     - 🎓 **Student Residents** (`/student-login`) with room registration and grievance tracking.
     - 🏛️ **Warden Administration** (`/warden-login`) with campus-wide triage and dispatch controls.
     - 🛠️ **Department Maintenance Depot** (`/department-login`) with trade switchers (Electrical, Plumbing, Carpentry, Network, Housekeeping).
   - Real incident photo evidence (Burnt switchboard, leaking geyser, corroded dripping tap).

2. **Application Layer (`backend/`)**:
   - Node.js & Express RESTful API.
   - Dedicated authentication endpoints (`/api/auth/student-login`, `/api/auth/warden-login`, `/api/auth/staff-login`, `/api/auth/register`).
   - Triage, technician dispatch, status timeline, and student feedback APIs.

3. **Data Layer (`backend/data/hostel.db`)**:
   - High-performance **SQLite 3** engine via `better-sqlite3`.
   - WAL (Write-Ahead Logging) mode enabled for high concurrency.
   - Automatic table provisioning and realistic campus pre-seeding (10 users, 5 initial complaints).

---

## 📁 Repository Structure

```text
MINOR1/
├── frontend/                     # Vercel Deploy-Ready Frontend
│   ├── dist/                     # Optimized static bundle (tsc && vite build)
│   ├── public/                   # University logo & real incident photos
│   │   ├── veltech_logo.jpg
│   │   └── images/               # switchboard.jpg, geyser.jpg, tap.jpg
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # PortalSelect.tsx, StudentLogin.tsx, WardenLogin.tsx, StaffLogin.tsx, AuthNavbar.tsx
│   │   │   ├── StudentView.tsx   # Student resident dashboard
│   │   │   ├── WardenView.tsx    # Warden triage & dispatch console
│   │   │   ├── StaffView.tsx     # Technician work orders console
│   │   │   ├── Navbar.tsx        # Institutional university header
│   │   │   └── DirectoryModal.tsx# 24x7 Emergency directory
│   │   ├── api.ts                # REST API Client
│   │   ├── types.ts              # TypeScript contracts
│   │   └── App.tsx               # Route coordinator & layout
│   ├── vercel.json               # SPA rewrite rules for Vercel
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Render Deploy-Ready Backend
│   ├── data/
│   │   └── hostel.db             # Transactional SQLite Database
│   ├── database.js               # SQLite database client & queries
│   ├── server.js                 # Express REST API (Port 5000)
│   ├── render.yaml               # Render web service blueprint
│   ├── Dockerfile                # Production container definition
│   └── package.json
│
├── docs/                         # Formal College Documentation
│   ├── WEEKLY_PROGRESS_REPORT.md # 15-day formal supervisor progress report
│   └── reference/                # PPT template and supervisor guide
├── dev-runner.js                 # Local dual-server launcher
├── package.json                  # Root convenience scripts
├── .gitignore                    # Production git ignore definitions
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Run Both Servers Concurrently
From the project root:
```bash
npm run dev
```
- **Frontend Portal:** http://localhost:3000
- **Backend API:** http://localhost:5000 (Health Check: `http://localhost:5000/api/health`)

### 2. Run Independently
- **Backend:**
  ```bash
  cd backend
  npm install
  npm start
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 🌐 Production Deployment Guide

### A. Deploy Backend on Render (Web Service)
1. Push your repository to **GitHub** (or connect directly via Git).
2. Go to **Render Dashboard** (`dashboard.render.com`) -> **New +** -> **Web Service**.
3. Select your repository.
4. Configure the settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free` (or Starter)
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render service URL (e.g., `https://veltech-hostel-api.onrender.com`).

---

### B. Deploy Frontend on Vercel
1. Go to **Vercel Dashboard** (`vercel.com`) -> **Add New...** -> **Project**.
2. Select your repository.
3. In the project setup screen:
   - **Root Directory:** Click **Edit** and choose `frontend`.
   - **Framework Preset:** `Vite` (automatically detected).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: `https://veltech-hostel-api.onrender.com/api` *(your Render backend URL)*
5. Click **Deploy**.
6. Vercel will build and assign a custom URL (e.g., `https://veltech-hostel-care.vercel.app`).
   *(The included `frontend/vercel.json` ensures that direct URLs like `/student-login` and `/warden-login` work without 404s)*.

---

## 👥 Demo & Evaluation Credentials

| Role | Portal URL | Identifier / Email | Password | Details |
|------|------------|--------------------|----------|---------|
| **Student** | `/student-login` | `VTU28319` | `password123` | K. Siddarth Patel (Block A, Room A-204) |
| **Student** | `/student-login` | `VTU28844` | `password123` | R. Sreevasthav (Block B, Room B-108) |
| **Student** | `/student-login` | `VTU27728` | `password123` | A. Rakesh (Block C, Room C-312) |
| **Chief Warden** | `/warden-login` | `chiefwarden@veltech.edu.in` | `wardenpassword123` | Dr. S. Manohar (Hostel Administration) |
| **Electrical Dept** | `/department-login` | `electrical@veltech.edu.in` | `staffpassword123` | Ramesh Kumar (Lead Electrician) |
| **Plumbing Dept** | `/department-login` | `plumbing@veltech.edu.in` | `staffpassword123` | Sundar Raj (Lead Plumber) |
| **Carpentry Dept** | `/department-login` | `carpentry@veltech.edu.in` | `staffpassword123` | Anthony Das (Lead Carpenter) |
| **Network Dept** | `/department-login` | `network@veltech.edu.in` | `staffpassword123` | Vignesh N. (Network Technician) |
| **Housekeeping** | `/department-login` | `housekeeping@veltech.edu.in` | `staffpassword123` | Selvam K. (Sanitation Supervisor) |

*(Each login screen also includes 1-click test credential helpers for convenient evaluation during reviews)*.
