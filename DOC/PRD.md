# Product Requirements Document (PRD)

# Project Name

CivicSevaAI – Employee Work Verification & Citizen Confirmation System

## 1. Purpose

CivicSevaAI is an AI-powered municipal assistance platform. This feature adds an employee work-verification process where municipal employees upload proof of completed work (photo + GPS location). The AI system validates whether the work is actually completed. Citizens are also asked to confirm whether the work has been completed.

---

# 2. Problem Statement

Currently municipal systems may mark complaints as completed without proper verification. Citizens may still face unresolved issues.

Examples:

* Employee marks pothole repaired but repair is incomplete.
* Garbage issue marked solved but garbage remains.
* Street light marked fixed but still not functioning.

The system requires:

1. Employee proof submission.
2. AI verification.
3. GPS verification.
4. Citizen confirmation.

---

# 3. Objectives

* Reduce fake completion reports.
* Improve transparency.
* Increase citizen trust.
* Verify employee work automatically.
* Include citizen feedback before final closure.

---

# 4. Stakeholders

Primary Users:

* Citizens
* Municipal Employees
* Municipal Admin

Secondary Users:

* Department Heads
* Government Authorities

---

# 5. Functional Requirements

## Module 1: Employee Work Submission

Employee flow:

1. Open complaint assigned.
2. Click "Mark Work Completed".
3. Upload:

   * Work image
   * GPS location
   * Completion remarks
4. Submit.

System stores:

* Complaint ID
* Employee ID
* Department
* Latitude
* Longitude
* Image
* Timestamp

---

## Module 2: GPS Verification

System checks:

IF employee GPS matches complaint location range:

Status = Location Verified

Else:

Status = GPS Mismatch

Rules:

* Accept radius: 50–100 meters
* If outside range → send to admin review

---

## Module 3: AI Image Verification

AI analyzes uploaded image.

Examples:

Complaint: Garbage issue
Expected result:

* Garbage removed

Complaint: Pothole
Expected result:

* Road repaired

Complaint: Street light
Expected result:

* Light pole fixed

AI checks:

* Object detection
* Image classification
* Complaint category matching
* Image authenticity

Decision:

If image and complaint match:

Status = Verified

Else:

Status = Incomplete

---

## Module 4: Citizen Confirmation

After AI verification:

Citizen receives notification:

"Municipal work for Complaint CV00125 is marked complete. Please confirm status."

Citizen options:

✅ Work completed

❌ Work not completed

Citizen may also:

* Upload photo
* Add comments

Example:

Comment:
"Street light still not working"

---

## Module 5: Final Decision Logic

Decision Flow:

Case 1:
GPS verified
+
AI verified
+
Citizen confirms complete

Final status:
COMPLETED

Case 2:
GPS verified
+
AI verified
+
Citizen rejects

Final status:
REOPEN COMPLAINT

Case 3:
GPS mismatch
OR
AI verification failed

Final status:
INCOMPLETE

Send to:
Admin review

---

# 6. Workflow Diagram

Citizen Complaint Created
↓
Assigned to Employee
↓
Employee completes work
↓
Employee uploads photo + GPS
↓
AI verifies image
↓
GPS validates location
↓
Citizen confirmation request
↓
Final decision
↓
Complete/Reopen/Admin Review

---

# 7. Database Structure

Complaint Table

Fields:

* Complaint_ID
* Citizen_ID
* Department
* Complaint_Type
* Status
* Location
* Date

Employee Verification Table

Fields:

* Verification_ID
* Employee_ID
* Complaint_ID
* GPS_Latitude
* GPS_Longitude
* Image_Path
* AI_Result
* Timestamp

Citizen Feedback Table

Fields:

* Feedback_ID
* Complaint_ID
* Citizen_Response
* Comment
* Image

---

# 8. Non-functional Requirements

Performance:

* Image verification within 5–10 seconds

Security:

* Secure image storage
* Authentication for employees
* GPS tampering detection

Scalability:

* Support multiple municipal departments

Availability:

* 24/7 service availability

---

# 9. Suggested Technology Stack

Frontend:

* React.js

Backend:

* Python FastAPI

Database:

* MySQL

AI Models:

* YOLO/Object Detection
* Image Classification Model

Maps:

* Leaflet + OpenStreetMap

Cloud Storage:

* Firebase/AWS S3

---

# 10. Expected Outcomes

* Increased trust in municipal systems
* Reduced fake work completion reports
* Faster complaint handling
* Better employee accountability
* Improved citizen satisfaction