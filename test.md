# CivicSevaAI — Demo & Testing Guide

> **Platform:** Municipal Grievance Management System  
> **Stack:** React (Frontend) + FastAPI (Backend) + MongoDB (Mock DB)

---

## 🚀 How to Start the System

### 1. Start the Backend
```bash
cd Backend
python -m uvicorn main:app --reload
# Backend runs at: http://127.0.0.1:8000
```

### 2. Start the Frontend
```bash
cd Frontend
npm run dev
# App runs at: http://localhost:5173
```

---

## 🔐 Login Credentials

### 👨‍💼 Admin Login
| Field | Value |
| :--- | :--- |
| **Email** | `ketanpatil@gmail.com` |
| **Password** | `1234` |
| **Link** | Click "LOGIN" on Landing Page |

### 👷 Worker Login (Any Worker can use '1234')
You can log in as any of the **41 workers** in the system.

| Department | Worker Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Water (Demo)** | Kiran Patil | `kiranpatil@gmail.com` | `1234` |
| **Water Supply** | Meena Sharma | `meena.sharma@municipal.gov` | `1234` |
| **Sanitation** | Riya Sharma | `riya.sharma@municipal.gov` | `1234` |
| **Roads & Infra** | Sneha More | `sneha.more@municipal.gov` | `1234` |
| **Electricity** | Anjali Verma | `anjali.verma@municipal.gov` | `1234` |
| **Waste Mgmt** | Anjali Patil | `anjali.patil@municipal.gov` | `1234` |

---

## 🤖 Citizen AI Assistant (Bot)

The bot is currently configured for a **zero-friction demo**.

### 1. New Registration
*   **Step:** Click **"Register"** button.
*   **Bot Ask:** *"Please enter your full name"* → Type: `Yash Patil`
*   **Bot Ask:** *"Please enter your email"* → Type: `yash@gmail.com`
*   **Result:** Auto-logged in! The bot remembers you for the session.

### 2. Checking Status
*   **Step:** Click **"Check Status"** button.
*   **If Logged In:** Bot instantly fetches your history.
*   **If Guest:** Bot asks for your registered email to search.

---

## 🧪 "Live Loop" Demo Walkthrough

### 1️⃣ Citizen Files a Case
1. Open bot at `/`
2. Register as **"Gaurav"** (`gaurav@gmail.com`)
3. Select **"Roads"** → Describe: *"Deep pothole on SV Road near crossing"*
4. **AI Magic:** Watch the bot predict "High Priority" and confirm.

### 2️⃣ Worker Resolves it
1. Login at `/worker-login` as **Sneha More** (`sneha.more@municipal.gov` / `1234`)
2. Go to **Assigned Tasks** → Find the SV Road case.
3. Click "Update" → Set to **Resolved** → Upload a "Repair" image.

### 3️⃣ Admin Verifies
1. Login at `/login` as **Admin** (`ketanpatil@gmail.com` / `1234`)
2. See the **Grievance Log** update live with the resolution image.

### 4️⃣ Citizen Rates the Service
1. Back to Bot → Click **"Check Status"**
2. See the resolution image! 
3. Click **"Yes, Close"** → Give **5 Stars** ⭐⭐⭐⭐⭐
4. Refresh the **Landing Page** to see the review appear in the live carousel!

---

## 📋 Initial Mock Dataset
The system starts with **6 unique citizens** and **5 ongoing tasks** assigned to Kiran Patil to make the dashboard look busy:

| Citizen Name | Email | Initial Status |
| :--- | :--- | :--- |
| Amit Pawar | `amit.pawar@gmail.com` | Pending |
| Sonal Mehta | `sonal.mehta@gmail.com` | Resolved |
| Vikram Singh | `vikram.singh@gmail.com` | Pending |
| Rajesh Tiwari | `rajesh.t@gmail.com` | Pending |
| Sneha Patil | `sneha.p@gmail.com` | Pending |

---

*© 2026 CivicSevaAI — Built for Digital India Initiative*
