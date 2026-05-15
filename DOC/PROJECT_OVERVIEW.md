# CivicSevaAI - Project Overview

**CivicSevaAI** is an AI-Powered Municipal Task Allocation & Smart Grievance Management System. Designed for the Government and local municipal corporations, the platform streamlines the entire grievance loop: from citizen complaint submission to automated worker allocation, visual proof-of-resolution, and citizen feedback.

---

## 1. System Design & Architecture

The architecture consists of a reactive decoupled frontend and an asynchronous Python backend, bound together via a high-performance RESTful API and centralized data storage. The application strongly enforces multi-tenancy rules (city-wise isolation) and Role-Based logic across three principal actors:

### The Three Core Actors:
1. **The Citizen (via Chatbot Interface):** Reports municipal problems colloquially, checks realtime status, and validates worker proof-of-work to close loops.
2. **The Field Operative (Worker Dashboard):** Accesses an isolated dashboard tracking their specific queue. When closing a task, they map their real-time GPS boundary and upload physical image proof of completion.
3. **The Administrator (Command Center):** Supervisors maintain strategic intelligence over an entire municipality through data-rich charts and a real-time stream of incoming/resolved grievances.

---

## 2. Tech Stack

### Frontend Architecture
* **Framework:** React.js initialized via Vite.
* **Styling:** Vanilla CSS, focused on responsive, custom glassmorphic interfaces and government-style branding.
* **Visualizations:** Chart.js + `react-chartjs-2` for analytics (Doughnuts, Lines).
* **Routing:** `react-router-dom` prioritizing component isolation.

### Backend Infrastructure
* **Framework:** FastAPI (Python), leveraging asynchronous asynchronous execution logic for scale.
* **Database:** MongoDB configured using Motor (Async Python Driver).
* **Validation:** Pydantic models to strictly enforce data schemas and multi-tenant security structures.

---

## 3. Core AI Modules & Infrastructure

Instead of manual intervention from call centers, the application uses **Backend Intelligence Modules**:
* **`utils/predict.py` (NLP Mapping Simulator):** Automatically scans incoming grievance text to correctly identify the structural category (Roads, Water Supply, Electricity, Sanitation, Waste Management) and assigns an appropriate severity Priority Level (Critical, High, Medium, Low).
* **`utils/allocator.py` (Smart Task Dispatcher):** Scans the operational queue of municipal workers in the required Department, factoring their active/pending workload to autonomously dedicate the complaint to the most optimal, free field operative.

---

## 4. MVP Working Workflow (The End-to-End Loop)

This application boasts a completely closed-loop operational flow. Below is the step-by-step MVP lifecycle of a grievance:

**Step 1: Citizen Submission**
* The citizen lands on the central Government Portal and operates the "Municipal AssistantBot". 
* They describe an issue (e.g. "There is a massive water leak outside the train station!"). 

**Step 2: AI Processing & Allocation**
* The bot sends the data. The backend intercepts it, predicting the category -> **Water Supply**, Priority -> **High**.
* The smart allocator searches for a Water Supply municipal worker with the least active tasks (e.g., *Amit Pawar*) and assigns him transparently. The citizen receives a 6-character Reference ID.

**Step 3: Tactical Worker Execution**
* Amit Pawar logs into the separate `Worker Dashboard`. He views his active allocated task.
* After arriving and fixing the issue, he executes the resolution protocol directly on the platform: capturing GPS coordinates and uploading a live proof image of the fixed area.

**Step 4: Citizen Validation & Review**
* The citizen accesses the AssistantBot, clicks **Check Status**, and logs in with their email.
* Because the task was resolved by Amit, the Bot instantly delivers the proof: displaying the image and GPS tag submitted by the worker.
* The citizen is asked, "Are you satisfied with this?". They reply "Yes, Close" and rate the service (1-5 stars).

**Step 5: Administrative Omniscience**
* At any given time, Municipal Commissioners can view the **Admin Dashboard**, evaluating live SLA turnaround consistency, monitoring worker deployment clusters, and observing macro-level operational metrics based on all of the above data.
