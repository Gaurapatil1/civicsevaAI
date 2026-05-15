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

@router.post("/predict")
async def predict_complaint(complaint: ComplaintCreate):
    """
    Returns AI predicted category and priority for a given message.
    Used for UI verification before final submission.
    """
    category, priority = predict_category_and_priority(complaint.message)
    return {"category": category, "priority": priority}

@router.post("/submit-complaint", status_code=status.HTTP_201_CREATED)
async def submit_complaint(complaint: ComplaintCreate):
    """
    Submits a new municipal grievance. (Aligned with bot.md workflow)
    
    Workflow:
    1. Receive message, citizen_name, and city.
    2. Run AI models to predict category and priority.
    3. Run task allocation engine to find the best worker.
    4. Save in MongoDB 'complaints' collection with citizen info.
    5. Return the full complaint details.
    """
    
    try:
        # 1. Check if database is initialized
        if db.db is None:
            raise HTTPException(status_code=500, detail="Database not connected.")

        # 2. AI Category and Priority Prediction
        pred_cat, priority = predict_category_and_priority(complaint.message)
        category = complaint.category if complaint.category else pred_cat
        
        # Ensure native python strings to prevent NumPy BSON encoding crashes
        category = str(category)
        priority = str(priority)
        
        print(f"AI Prediction: Category={category}, Priority={priority}")

        # 3. Worker Allocation
        worker = await find_best_worker(db.db, category, priority)
        
        worker_data = None
        if worker:
            worker_data = {
                "worker_id": str(worker.get("worker_id", worker["_id"])),
                "name": str(worker["name"]),
                "department": str(worker["dept"]),
                "designation": str(worker.get("role", "worker"))
            }

        # 4. Create record for MongoDB
        complaint_id = str(uuid.uuid4())
        complaint_record = {
            "_id": complaint_id,
            "citizen_name": complaint.citizen_name,
            "city": complaint.city,
            "message": complaint.message,
            "category": category,
            "priority": priority,
            "assigned_worker": worker_data,
            "status": "Pending",
            "created_at": datetime.utcnow()
        }

        # 5. Insert into MongoDB
        await db.db.complaints.insert_one(complaint_record)
        
        if worker_data:
            await db.db.workers.update_one(
                {"_id": worker["_id"]},
                {"$inc": {"active_tasks": 1}}
            )

        return {
            "id": complaint_id,
            "citizen_name": complaint.citizen_name,
            "city": complaint.city,
            "message": complaint.message,
            "category": category,
            "priority": priority,
            "assigned_worker": worker_data,
            "status": "Pending",
            "created_at": complaint_record["created_at"]
        }
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        print(err_msg)
        raise HTTPException(status_code=500, detail=str(err_msg))

# NEW WORKFLOW ENDPOINTS

from models.complaint import ResolutionUpdate, CitizenFeedback

@router.put("/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str, update: ResolutionUpdate):
    """
    Step 2 & 3: Worker marks task as completed and uploads proof.
    """
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")

    complaint = await db.db.complaints.find_one({"_id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Update Complaint Status
    update_data = {
        "status": "Resolved",
        "completion_note": update.completion_note,
        "completion_image": update.completion_image,
        "gps_coordinates": update.gps_coordinates,
        "resolved_at": datetime.utcnow()
    }

    await db.db.complaints.update_one({"_id": complaint_id}, {"$set": update_data})

    # Decrement Worker active tasks
    if complaint.get("assigned_worker"):
        await db.db.workers.update_one(
            {"worker_id": complaint["assigned_worker"]["worker_id"]},
            {"$inc": {"active_tasks": -1}}
        )

    return {"status": "success", "message": "Complaint resolved successfully"}

@router.get("/user/{citizen_name}")
async def get_user_complaints(citizen_name: str):
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")
    
    cursor = db.db.complaints.find({"citizen_name": citizen_name}).sort("created_at", -1).limit(5)
    complaints = await cursor.to_list(length=5)
    for c in complaints:
        c["id"] = c["_id"]
    return complaints

@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str):
    """
    Get complaint details by ID, used for citizen polling status.
    """
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")

    complaint = await db.db.complaints.find_one({"_id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint["id"] = complaint["_id"]
    return complaint

@router.post("/{complaint_id}/feedback")
async def submit_feedback(complaint_id: str, feedback: CitizenFeedback):
    """
    Step 5 & 6: Citizen provides rating and feedback.
    """
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")

    complaint = await db.db.complaints.find_one({"_id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Store rating and feedback
    await db.db.complaints.update_one(
        {"_id": complaint_id},
        {"$set": {"rating": feedback.rating, "feedback": feedback.feedback}}
    )

    # Update Worker rating (simple average logic could be added here in a real system)
    if complaint.get("assigned_worker"):
        worker_id = complaint["assigned_worker"]["worker_id"]
        # In a real system, we'd recalculate the worker's average rating here.
        # For the demo, we just store it in the complaint record which the dashboard will aggregate.
        pass

    return {"status": "success", "message": "Feedback received. Jai Hind!"}
