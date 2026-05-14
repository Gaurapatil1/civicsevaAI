# PRD2: CivicSevaAI — AI-Powered Municipal Task Allocation & Smart Grievance Management System

**Document Version:** 2.0  
**Status:** Draft  
**Product:** CivicSevaAI  
**Target Release:** Hackathon Demo / MVP

---

## 1. Product Overview

CivicSevaAI is an end-to-end AI-powered municipal governance platform that digitises the full lifecycle of citizen grievances — from complaint submission to worker resolution and citizen feedback — using intelligent automation at every stage.

### Core Value Proposition

> Complaint Submission → AI Analysis → Smart Task Allocation → Worker Resolution Tracking → Proof Verification → Citizen Feedback → Workforce Analytics

The platform bridges the gap between citizens and municipal workers through real-time AI-driven orchestration, replacing manual, opaque complaint workflows with a transparent, data-backed operational system.

---

## 2. Problem Statement

Municipal grievance management in Indian cities suffers from:

- No structured intake channel (citizens resort to calls, walk-ins, or social media)
- Manual triage leading to delayed or misrouted complaints
- No visibility for citizens on complaint status or assigned worker
- Workers lack a unified tool to receive, update, and document task completion
- Admins have no real-time analytics on department workload or citizen satisfaction
- No feedback loop to improve worker allocation over time

---

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Reduce average complaint resolution time | < 48 hours for High priority |
| Automate complaint categorisation | ≥ 90% AI accuracy |
| Improve citizen satisfaction | Average rating ≥ 4/5 stars |
| Increase worker accountability | 100% tasks with proof image on completion |
| Admin visibility | Real-time dashboard with < 5 min data lag |

---

## 4. User Personas

### 4.1 Citizen (Rahul, 34, Mumbai resident)
- Submits complaints about local issues (water, roads, garbage)
- Wants quick acknowledgement, status updates, and resolution proof
- Comfortable with WhatsApp-style chat interfaces

### 4.2 Municipal Worker (Amit Patil, Field Technician)
- Receives task assignments on a mobile-friendly dashboard
- Updates task status in the field
- Uploads photographic proof of completion

### 4.3 Municipal Admin (Department Head)
- Monitors complaint volumes, resolution rates, and worker performance
- Needs aggregate analytics to make staffing and budget decisions
- Requires no technical expertise to use the dashboard

---

## 5. Complete System Workflow

```
Citizen Complaint
       ↓
  AI Prediction (Category + Priority)
       ↓
  Smart Worker Allocation
       ↓
  Worker Dashboard — Task Update + Proof Upload
       ↓
  Citizen Complaint Status Tracking
       ↓
  Citizen Rating & Feedback
       ↓
  Admin Dashboard Analytics Update
```

---

## 6. Feature Specifications

### 6.1 Citizen Complaint Bot

**Interface:** WhatsApp-style conversational UI (web or mobile)

**Citizen Workflow:**

1. **Login / Register** — Phone-based authentication (OTP or simple credentials for demo)
2. **Submit Complaint** — Free-text input (e.g., "Water supply problem in Mumbai")
3. **Receive Complaint ID** — Auto-generated unique reference (e.g., `CSA-2024-00142`)
4. **Receive AI Priority Notification** — Instant feedback on predicted category and priority level

**Additional Bot Options:**
- Track existing complaint
- View complaint history
- Submit feedback/rating

**Acceptance Criteria:**
- Complaint submitted in < 3 taps/messages
- Complaint ID displayed immediately after submission
- AI prediction returned within 2 seconds

---

### 6.2 AI Prediction Engine

**Trigger:** Fires automatically on every new complaint submission

**Outputs:**

| Field | Example |
|---|---|
| Category | Water, Roads, Garbage, Electricity, Sanitation |
| Priority | High, Medium, Low |

**Logic:**
- NLP-based classification on complaint text
- Priority derived from category urgency rules and keyword signals (e.g., "no water", "flooding", "accident")
- Fallback: default to Medium priority if confidence < threshold

**Acceptance Criteria:**
- Category and priority assigned within 2 seconds of submission
- Results stored to complaint record in MongoDB
- Admin can override AI prediction manually

---

### 6.3 Smart Worker Allocation Engine

**Trigger:** Fires after AI prediction is complete

**Allocation Logic:**

1. Filter workers by matching department/category
2. Check real-time worker availability (not on leave, active shift)
3. Score by current active task count (workload balancing)
4. Assign worker with lowest workload score

**Output:** Complaint record updated with `assigned_worker` field

**Acceptance Criteria:**
- Worker assigned within 3 seconds of AI prediction
- System prevents assigning to unavailable workers
- Ties broken by alphabetical order (deterministic for demo)

---

### 6.4 Worker Dashboard

**Interface:** Separate web dashboard (mobile-responsive)

**Authentication:** Worker login with credentials

#### 6.4.1 Assigned Task List

Workers see a list of their assigned complaints with:

- Complaint ID and description
- Citizen location / ward
- Category and priority level (colour-coded: Red = High, Orange = Medium, Green = Low)
- Date and time of assignment

#### 6.4.2 Task Status Update

Worker can update status per task:

| Status | Description |
|---|---|
| Pending | Assigned but not yet started |
| In Progress | Worker is actively working on the issue |
| Completed | Issue resolved |

Status change timestamped and stored.

#### 6.4.3 Proof Image Upload

- Worker uploads one or more images as completion evidence
- Accepted formats: JPG, PNG (max 5 MB per image)
- Storage path: `public/uploads/` (local) or cloud storage (production)
- Example filename: `water_fix_mumbai_CSA-2024-00142.jpg`
- Image URL stored in complaint record under `complent_image`

**Acceptance Criteria:**
- Worker cannot mark "Completed" without uploading at least one image
- Image preview shown in dashboard after upload
- Upload success/failure notification displayed

---

### 6.5 Complaint Status Tracking (Citizen)

**Access:** Via Citizen Bot → "Track Complaint Status" option

**Citizen Tracking Workflow:**

```
Citizen Login
     ↓
Complaint History (list of all complaints)
     ↓
Open Specific Complaint
     ↓
View Current Status + Assigned Worker Name
     ↓
View Uploaded Proof Image (if completed)
     ↓
Option to Submit Rating (if status = Completed)
```

**Information Displayed Per Complaint:**

| Field | Detail |
|---|---|
| Status | Pending / In Progress / Completed |
| Assigned Worker | Name (e.g., Amit Patil) |
| Completion Note | Worker's optional note |
| Proof Image | Thumbnail with full-view option |
| Rating | Citizen's submitted rating (if given) |

**Acceptance Criteria:**
- Status reflects worker updates within 30 seconds
- Proof image visible to citizen only after worker uploads it
- Rating option shown only when status is "Completed" and no prior rating exists

---

### 6.6 Citizen Rating & Feedback System

**Trigger:** Complaint status moves to "Completed"

**Citizen Provides:**
- Star rating: 1–5 stars (required)
- Text feedback: optional free-text (e.g., "Water issue resolved quickly.")

**Data Stored:**
- `rating` (integer 1–5) on complaint document
- `feedback` (string) on complaint document
- Timestamp of rating submission

**Acceptance Criteria:**
- Rating can only be submitted once per complaint
- Feedback is optional; rating is mandatory to submit
- Rating immediately reflected in worker's performance score

---

### 6.7 Worker Performance Analytics

**Purpose:** Feed historical performance data back into the allocation engine to improve future assignments

**Metrics Tracked Per Worker:**

| Metric | Source |
|---|---|
| Average citizen rating | Aggregated from `rating` field |
| Total completed tasks | Count of `status: Completed` |
| Active task count | Count of `status: In Progress` |
| Average resolution time | `completed_at` minus `assigned_at` |

**Storage:** Derived metrics cached in worker document or computed at query time

**Usage:** Allocation engine weights workers with higher average ratings and faster resolution times for High-priority complaints.

---

### 6.8 Admin Dashboard

**Interface:** Web dashboard (desktop-first)

**Sections:**

#### Complaint Monitoring
- Total complaints (today / week / all time)
- Complaints by status (Pending / In Progress / Completed)
- Complaints by category (pie/bar chart)
- Complaints by priority (distribution chart)
- List view with filters (status, category, priority, date range)

#### Worker Monitoring
- Worker list with active task count
- Per-worker: average rating, completed tasks, avg resolution time
- Flagging: workers with rating < 3 or > 10 active tasks

#### Analytics
- Complaint volume trend (daily/weekly)
- Category distribution
- Priority distribution
- Citizen satisfaction trend (average rating over time)
- Top-performing workers

#### Proof Image Review
- Admin can view uploaded proof images per complaint
- Can flag incomplete or suspicious uploads

**Acceptance Criteria:**
- Dashboard data auto-refreshes every 60 seconds
- All charts render correctly on 1280×800 desktop viewport
- Admin can export complaint list as CSV

---

## 7. Data Model

### MongoDB Collections

#### complaints
```json
{
  "_id": "ObjectId",
  "complaint_id": "CSA-2024-00142",
  "citizen_id": "ObjectId (ref: users)",
  "citizen_name": "Rahul Sharma",
  "message": "Water supply problem in Mumbai.",
  "category": "Water",
  "priority": "High",
  "assigned_worker": "ObjectId (ref: workers)",
  "assigned_worker_name": "Amit Patil",
  "status": "Completed",
  "completion_image": "/uploads/water_fix_mumbai.jpg",
  "completion_note": "Pipeline repaired and tested.",
  "rating": 5,
  "feedback": "Water issue resolved quickly.",
  "created_at": "ISODate",
  "assigned_at": "ISODate",
  "completed_at": "ISODate",
  "rated_at": "ISODate"
}
```

#### workers
```json
{
  "_id": "ObjectId",
  "name": "Amit Patil",
  "department": "Water",
  "available": true,
  "active_task_count": 2,
  "avg_rating": 4.7,
  "total_completed": 38,
  "created_at": "ISODate"
}
```

#### users (citizens)
```json
{
  "_id": "ObjectId",
  "name": "Rahul Sharma",
  "phone": "+91XXXXXXXXXX",
  "ward": "Mumbai - Andheri West",
  "created_at": "ISODate"
}
```

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Frontend (Citizen Bot) | React.js / Next.js |
| Frontend (Worker Dashboard) | React.js |
| Frontend (Admin Dashboard) | React.js + Recharts |
| Backend API | Node.js + Express |
| AI Prediction | Python (scikit-learn / spaCy) or OpenAI API |
| Database | MongoDB (Atlas or local) |
| Image Storage | Local `public/uploads/` (demo) / AWS S3 (prod) |
| Authentication | JWT tokens |

---

## 9. Hackathon Demo Setup

### Pre-loaded Seed Data

| Item | Detail |
|---|---|
| Workers | 3 workers across Water, Roads, Garbage departments |
| Sample complaints | 10 complaints in various states (Pending, In Progress, Completed) |
| Sample images | 3 repair proof images in `public/uploads/` |
| Admin account | `admin@civicseva.in` / `demo123` |
| Worker accounts | `amit@civicseva.in`, `priya@civicseva.in`, `ravi@civicseva.in` |

### Demo Walkthrough Script

1. Citizen submits complaint via bot → AI predicts category + priority
2. Complaint appears in Worker Dashboard for Amit Patil
3. Amit updates status to "In Progress", then "Completed", uploads repair image
4. Citizen checks status, views proof image, submits 5-star rating
5. Admin Dashboard updates: rating reflects in worker analytics, complaint marked resolved

---

## 10. Out of Scope (v1)

- Real SMS/WhatsApp integration (simulated in bot UI)
- Native mobile apps (iOS/Android)
- Multi-language support (Hindi/Marathi)
- Geo-location auto-detect for complaints
- SLA breach notifications / escalation engine
- Payment integration for premium services
- Multi-city / multi-tenant support

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI misclassifies category | Admin override available; fallback to "General" category |
| Worker not available at assignment time | Engine checks availability flag; re-assigns on rejection |
| Image upload fails | Retry UI shown; worker notified; complaint not locked |
| MongoDB connection failure | Graceful error page; retry logic on API layer |

---

## 12. Appendix: Complete User Flow Diagram

```
[Citizen]
   │
   ├─ Login / Register
   ├─ Submit Complaint ("Water supply problem in Mumbai")
   │         │
   │    [AI Engine]
   │         ├─ Category: Water
   │         └─ Priority: High
   │         │
   │    [Allocation Engine]
   │         ├─ Department: Water
   │         ├─ Available worker found: Amit Patil
   │         └─ Complaint assigned → Notification sent
   │
   ├─ Track Complaint
   │         ├─ Status: In Progress
   │         ├─ Worker: Amit Patil
   │         └─ Proof Image: water_fix_mumbai.jpg ✓
   │
   └─ Submit Rating: ⭐⭐⭐⭐⭐
             └─ Feedback: "Water issue resolved quickly."

[Worker: Amit Patil]
   ├─ View assigned task in Worker Dashboard
   ├─ Update status: Pending → In Progress → Completed
   └─ Upload proof image

[Admin]
   ├─ Complaint Monitoring: Resolution rate updated
   ├─ Worker Monitoring: Amit's avg rating = 4.8
   └─ Analytics: Citizen satisfaction trend ↑
```