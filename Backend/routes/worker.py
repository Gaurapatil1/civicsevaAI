import os
import shutil
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from database import db
from datetime import datetime

router = APIRouter(prefix="/worker", tags=["Worker"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/login")
async def worker_login(payload: dict):
    # Expects email and password in JSON body
    email = payload.get("email")
    password = payload.get("password")
    
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")
        
    email_regex = {"$regex": f"^{email}$", "$options": "i"}    
    # Try workers collection first (Master Worker Data)
    found_worker = await db.db.workers.find_one({"email": email_regex})
    
    if not found_worker:
        # Fallback to users collection (Seeded Accounts)
        found_worker = await db.db.users.find_one({"email": email_regex, "role": "worker"})
        
    if not found_worker:
        raise HTTPException(status_code=401, detail="Field Operative account not found.")
        
    # Check against both possible password fields (legacy 'password' or 'password_hash')
    stored_pw = found_worker.get("password") or found_worker.get("password_hash")
    
    if stored_pw != password:
         raise HTTPException(status_code=401, detail="Incorrect password. Access denied.")
         
    return {
        "message": "Worker Login successful",
        "user": {
            "name": found_worker["name"],
            "email": found_worker["email"],
            "role": "worker",
            "dept": found_worker.get("dept") or found_worker.get("department") or "General Operations",
            "worker_id": str(found_worker.get("worker_id") or found_worker.get("_id"))
        },
        "token": "fake-jwt-token-worker"
    }

@router.get("/tasks")
async def get_worker_tasks(email: str):
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")
        
    found_worker = await db.db.workers.find_one({"email": email})
    if not found_worker:
         raise HTTPException(status_code=404, detail="Worker not found.")
         
    # Our DB logic puts worker info in 'assigned_worker.name' or 'assigned_worker.worker_id'
    worker_name = found_worker["name"]
    
    # fetch all tasks assigned to this worker
    cursor = db.db.complaints.find({"assigned_worker.name": worker_name})
    tasks = await cursor.to_list(length=100)
    for t in tasks:
        t["_id"] = str(t["_id"])
    return tasks

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file sent.")
        
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return absolute URL to prevent frontend routing errors
    return {"message": "Image uploaded successfully", "image_path": f"http://127.0.0.1:8000/uploads/{file_name}"}

@router.put("/update-task")
async def update_task(payload: dict):
    complaint_id = payload.get("complaint_id")
    status = payload.get("status")
    note = payload.get("completion_note")
    image = payload.get("completion_image")
    
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")
        
    update_data = {
        "status": status,
        "completion_note": note,
        "completion_image": image,
        "resolved_at": datetime.utcnow()
    }
    
    # Try to update by string ID or ObjectId
    from bson import ObjectId
    try:
        obj_id = ObjectId(complaint_id)
        result = await db.db.complaints.update_one({"$or": [{"_id": complaint_id}, {"_id": obj_id}]}, {"$set": update_data})
    except:
        # If not a valid ObjectId (like demo UUID strings), just use string
        result = await db.db.complaints.update_one({"_id": complaint_id}, {"$set": update_data})
        
    if result.modified_count == 0:
         raise HTTPException(status_code=400, detail="Failed to update complaint.")
         
    return {"message": "Task updated successfully."}
