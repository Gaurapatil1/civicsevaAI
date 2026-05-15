# Technical System Architecture

# CivicSevaAI

AI-Powered Municipal Task Allocation & Smart Grievance Management System

---

# 1. System Goal

The system is designed to solve:

* delayed municipal complaint handling
* manual worker assignment
* poor operational visibility

The platform provides:

* citizen complaint registration
* AI-based complaint analysis
* automatic worker assignment
* worker task management
* citizen review system
* centralized admin monitoring

---

# 2. Main System Modules

The system contains 3 major modules:

| Module                | Purpose                           |
| --------------------- | --------------------------------- |
| Citizen Complaint Bot | Complaint registration & tracking |
| Worker Dashboard      | Task management & report upload   |
| Admin Dashboard       | Monitoring & analytics            |

---

# 3. Complete System Workflow

Citizen Complaint
↓
AI Prediction Engine
↓
Automatic Worker Allocation
↓
Worker Dashboard Task Update
↓
Proof Image Upload
↓
Citizen Review & Rating
↓
Admin Dashboard Analytics

---

# 4. Landing Page Architecture

The landing page contains:

## Admin Login

Admins login to monitor:

* complaints
* workers
* ratings
* analytics

---

## Worker Login

Workers login to:

* see assigned tasks
* update status
* upload completion report

---

## Citizen Complaint Bot

Citizens:

* register/login
* submit complaints
* track complaint status
* review completed work

---

# 5. Citizen Complaint Bot Workflow

## Step 1 — Citizen Registration

Citizen registers using:

* name
* email
* phone
* password
* city

Data stored in:
MongoDB → citizens collection

---

## Step 2 — Complaint Submission

Citizen submits complaint:

Example:
"Water supply issue in Mumbai"

Complaint stored temporarily and sent to AI engine.

---

# 6. AI Prediction Workflow

The backend AI system performs:

## Category Prediction

Input:
"Water supply issue in Mumbai"

Output:
Category → Water

---

## Priority Prediction

Output:
Priority → High

The AI uses:

* TF-IDF vectorization
* Random Forest models

---

# 7. Worker Allocation Engine

The backend checks:

* worker department
* worker city
* active tasks
* availability

Example workers:

| Worker       | Department | Active Tasks |
| ------------ | ---------- | ------------ |
| Amit Patil   | Water      | 2            |
| Rohit Sharma | Water      | 6            |

The system calculates operational score:

score =
(active_tasks × 0.5)
+
(avg_resolution_hours × 0.3)

Best worker selected automatically.

Assigned Worker:
Amit Patil

---

# 8. Complaint Storage

Final complaint stored in MongoDB.

Example:

{
"citizen_name": "Rahul Sharma",
"city": "Mumbai",
"message": "Water supply issue in Mumbai",
"category": "Water",
"priority": "High",
"assigned_worker": "Amit Patil",
"status": "Pending"
}

---

# 9. Worker Dashboard Workflow

Worker logs in using:

* email
* password

The dashboard automatically loads assigned complaints.

Worker sees:

* complaint message
* citizen city
* priority
* task status

---

# 10. Task Completion Workflow

Worker updates:

* task status
* completion note
* proof image

Example:
"Water pipeline repaired successfully."

Image uploaded:
repair_water_mumbai.jpg

Complaint status:
Completed

---

# 11. Citizen Review Workflow

Citizen opens:
"Track Complaint Status"

Citizen sees:

* assigned worker
* uploaded repair image
* completion note

Citizen gives:

* star rating
* feedback

Example:
⭐⭐⭐⭐⭐

"Problem solved quickly."

---

# 12. Admin Dashboard Workflow

Admin dashboard automatically updates.

Admin can monitor:

* all complaints
* assigned workers
* completion reports
* citizen ratings
* analytics

---

# 13. Example Complete Complaint Lifecycle

## Citizen Complaint

Rahul Sharma submits:
"Water supply issue in Mumbai"

---

## AI Prediction

Category:
Water

Priority:
High

---

## Worker Allocation

Assigned Worker:
Amit Patil

---

## Worker Action

Worker uploads:

* repaired image
* completion note

Status:
Completed

---

## Citizen Review

Rating:
5 Stars

Feedback:
"Resolved quickly."

---

## Dashboard Analytics

Admin dashboard updates:

* completed complaints
* worker ratings
* complaint statistics

---

# 14. Backend Architecture

Frontend
↓
Axios API Requests
↓
FastAPI Backend
↓
AI Prediction Engine
↓
Task Allocation Engine
↓
MongoDB Atlas

---

# 15. MongoDB Collections

## citizens

Stores citizen accounts.

## workers

Stores worker accounts and workload.

## complaints

Stores complaint lifecycle.

## admins

Stores admin credentials.

---

# 16. Final Innovation

Unlike traditional complaint portals, CivicSevaAI provides:

* AI-based prioritization
* automated worker allocation
* workload balancing
* proof-based task completion
* citizen satisfaction tracking

creating a lightweight smart governance operations platform.
