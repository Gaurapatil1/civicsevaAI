from fastapi import APIRouter, HTTPException, status
from models.complaint import ComplaintCreate, ComplaintResponse, WorkerInfo
from utils.predict import predict_category_and_priority
from utils.allocator import find_best_worker
from database import db
from datetime import datetime
import uuid

# ==========================================
# COMPLAINT SUBMISSION API (Prompt 9)
# ==========================================

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("/submit-complaint", status_code=status.HTTP_201_CREATED)
async def submit_complaint(complaint: ComplaintCreate):
    """
    Submits a new municipal complaint.
    
    Workflow:
    1. Receive text message.
    2. Run AI models to predict category and priority.
    3. Run task allocation engine to find the best worker.
    4. Save everything in MongoDB 'complaints' collection.
    5. Return the full complaint details.
    """
    
    # 1. Check if database is initialized
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")

    # 2. AI Category and Priority Prediction
    # This calls our joblib-loaded models
    category, priority = predict_category_and_priority(complaint.message)
    print(f"AI Prediction: Category={category}, Priority={priority}")

    # 3. Worker Allocation
    # Finds the worker with the lowest workload in the predicted category
    worker = await find_best_worker(category)
    
    worker_data = None
    if worker:
        # Extract only necessary worker info for the response
        worker_data = {
            "worker_id": worker["worker_id"],
            "name": worker["name"],
            "department": worker["department"],
            "designation": worker.get("designation")
        }
        print(f"Allocated Worker: {worker['name']} ({worker.get('designation')})")

    # 4. Create record for MongoDB
    complaint_id = str(uuid.uuid4())
    complaint_record = {
        "_id": complaint_id,
        "message": complaint.message,
        "category": category,
        "priority": priority,
        "assigned_worker": worker_data,
        "status": "Assigned" if worker_data else "Pending",
        "created_at": datetime.utcnow()
    }

    # 5. Insert into MongoDB
    try:
        await db.db.complaints.insert_one(complaint_record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {e}")

    # 6. Format and return response
    return {
        "id": complaint_id,
        "message": complaint.message,
        "category": category,
        "priority": priority,
        "assigned_worker": worker_data,
        "status": complaint_record["status"],
        "created_at": complaint_record["created_at"]
    }
