# CivicSevaAI - AI-Powered Municipal Grievance Management System

This is the backend for CivicSevaAI, built with **FastAPI** and **MongoDB**, featuring AI-driven complaint classification and smart worker allocation.

## 🚀 Backend Architecture

The backend follows a modular architecture for scalability and readability:
- `main.py`: Entry point of the application.
- `database.py`: MongoDB Atlas connection logic using Motor (Async).
- `models/`: Pydantic schemas for data validation.
- `routes/`: API endpoints for complaints and admin dashboard.
- `utils/`: AI prediction logic, worker allocation engine, and data seeders.
- `data/`: CSV datasets for workers and ML training.

## 🛠 APIs

### Complaints API
- `POST /complaints/submit-complaint`: 
  - Submits a citizen grievance.
  - Automatically predicts **Category** and **Priority** using ML.
  - Assigns the **Best Worker** based on workload.
  - Stores record in MongoDB.

### Dashboard API
- `GET /dashboard/stats`: 
  - Returns real-time analytics.
  - Counts critical complaints.
  - Lists available workers and recent grievances.

## 🤖 AI Workflow

1. **Preprocessing**: Complaint text is cleaned (lower-cased, special characters removed).
2. **Vectorization**: TF-IDF Vectorizer transforms text into numerical features.
3. **Prediction**:
   - `category_model.pkl`: Predicts if the issue is Water, Electricity, Sanitation, or Roads.
   - `priority_model.pkl`: Predicts priority (Low, Medium, High, Critical).

## ⚖️ Allocation Logic

The **Task Allocation Engine** uses a smart workload formula to ensure no worker is overwhelmed:
```
score = (active_tasks * 0.5) + (avg_resolution_hours * 0.3)
```
- Filters workers by department (matching the predicted category).
- Picks the worker with the **Lowest Score**.

## 📊 MongoDB Structure

- **Collection: `workers`**: Stores worker info, department, and current workload.
- **Collection: `complaints`**: Stores citizen grievances, AI predictions, and assigned worker details.

## ⚙️ Setup & Installation

1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Setup .env**: Add your `MONGODB_URL`.
3. **Train Models**: `python utils/train_models.py`
4. **Seed Workers**: `python utils/seed_workers.py`
5. **Run Server**: `uvicorn main:app --reload`
