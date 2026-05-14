# Detailed Complaint Allocation Workflow

# CivicSevaAI

---

# Step 1 — Citizen Opens Complaint Bot

The citizen opens the CivicSevaAI complaint bot interface.

Bot Message:
"Welcome to CivicSevaAI Smart Grievance System.
Please login or register to continue."

---

# Step 2 — Citizen Login / Registration

Citizen registers using:

* Full Name
* Email
* Phone Number
* Password
* City

Example:

Name: Rahul Sharma
City: Mumbai

The user account is stored in MongoDB.

---

# Step 3 — Citizen Submits Complaint

Bot asks:

"Please describe your issue."

Citizen types:

"Water supply is not available in Andheri Mumbai since morning."

---

# Step 4 — Complaint Sent to Backend

React frontend sends complaint data to FastAPI backend.

Request Example:

{
"citizen_name": "Rahul Sharma",
"city": "Mumbai",
"message": "Water supply is not available in Andheri Mumbai since morning."
}

---

# Step 5 — AI Prediction Engine Starts

The backend sends complaint text to the ML engine.

The ML model performs:

## Category Prediction

AI predicts:

Category = Water

because the complaint contains keywords:

* water
* supply

---

## Priority Prediction

AI predicts:

Priority = High

because:

* essential public service
* affecting residential area
* active disruption

---

# Step 6 — Department Detection

The backend maps:

Category = Water

to:

Department = Water Management Department

---

# Step 7 — Worker Allocation Engine Starts

Backend checks MongoDB workers collection.

Example workers:

[
{
"name": "Amit Patil",
"city": "Mumbai",
"department": "Water",
"active_tasks": 2,
"availability": true,
"avg_resolution_hours": 5
},
{
"name": "Rohit Sharma",
"city": "Mumbai",
"department": "Water",
"active_tasks": 6,
"availability": true,
"avg_resolution_hours": 9
}
]

---

# Step 8 — Allocation Score Calculation

The backend calculates operational scores.

Formula:

score =
(active_tasks × 0.5)
+
(avg_resolution_hours × 0.3)

---

# Example Calculation

## Amit Patil

(2 × 0.5) + (5 × 0.3)
= 1 + 1.5
= 2.5

---

## Rohit Sharma

(6 × 0.5) + (9 × 0.3)
= 3 + 2.7
= 5.7

---

# Step 9 — Best Worker Selected

System selects:

Amit Patil

because:

* fewer active tasks
* faster historical completion
* available in Mumbai
* belongs to Water department

---

# Step 10 — Complaint Stored in MongoDB

Complaint document:

{
"citizen_name": "Rahul Sharma",
"city": "Mumbai",
"message": "Water supply is not available in Andheri Mumbai since morning.",
"category": "Water",
"priority": "High",
"assigned_worker": "Amit Patil",
"status": "Pending"
}

---

# Step 11 — Citizen Receives Confirmation

Bot Response:

"Your complaint has been registered successfully.

Complaint ID: MUM1045
Category: Water
Priority: High
Assigned Worker: Amit Patil"

---

# Step 12 — Admin Dashboard Updates

The complaint instantly appears on admin dashboard.

Admin sees:

| Citizen      | City   | Complaint          | Priority | Assigned Worker | Status  |
| ------------ | ------ | ------------------ | -------- | --------------- | ------- |
| Rahul Sharma | Mumbai | Water supply issue | High     | Amit Patil      | Pending |

---

# Step 13 — Dashboard Analytics Updates

Dashboard analytics automatically update:

* Water complaints count
* Mumbai complaint statistics
* Worker workload
* Priority distribution

---

# Final System Flow

Citizen Complaint
↓
Complaint Bot Interface
↓
FastAPI Backend
↓
AI Category Prediction
↓
AI Priority Prediction
↓
Department Mapping
↓
Worker Allocation Engine
↓
MongoDB Storage
↓
Admin Dashboard Monitoring

---

# Core Innovation

The system combines:

* AI-based complaint understanding
* operational workload balancing
* automated municipal task assignment

to improve complaint resolution efficiency in workforce-constrained municipal environments.
