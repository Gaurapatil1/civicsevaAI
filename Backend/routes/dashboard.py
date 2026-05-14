from fastapi import APIRouter, HTTPException
from database import db

# ==========================================
# ADMIN DASHBOARD API (Prompt 10)
# ==========================================

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_analytics():
    """
    Fetches analytics and stats for the admin dashboard.
    """
    
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")

    # 1. Fetch complaints
    complaints_cursor = db.db.complaints.find().sort("created_at", -1)
    all_complaints = await complaints_cursor.to_list(length=100)

    # 2. Fetch ALL workers
    workers_cursor = db.db.workers.find({})
    all_workers = await workers_cursor.to_list(length=1000)

    # 3. Calculate Analytics
    total_complaints_count = len(all_complaints)
    pending_count = sum(1 for c in all_complaints if c.get("status") == "Pending")
    resolved_count = sum(1 for c in all_complaints if c.get("status") == "Resolved")
    critical_count = sum(1 for c in all_complaints if (c.get("priority") == "Critical" or c.get("priority") == "High"))
    
    # Category distribution for chart
    categories = {}
    for c in all_complaints:
        cat = c.get("category", "General")
        categories[cat] = categories.get(cat, 0) + 1

    # Worker summary with task counts
    worker_stats = []
    for w in all_workers:
        # Count tasks assigned to this worker in complaints collection
        assigned_tasks = sum(1 for c in all_complaints if c.get("assigned_worker", {}).get("worker_id") == w.get("worker_id"))
        worker_stats.append({
            "name": w["name"],
            "dept": w["department"],
            "tasks": assigned_tasks,
            "status": "Available" if w.get("availability") else "On Field",
            "id": w.get("worker_id")
        })

    # 5. New PRD modules: Verification & Feedback
    verifications_cursor = db.db.verifications.find({})
    all_verifications = await verifications_cursor.to_list(length=100)
    
    feedbacks_cursor = db.db.feedbacks.find({})
    all_feedbacks = await feedbacks_cursor.to_list(length=100)

    # 6. Final Response
    return {
        "analytics": {
            "total_complaints": total_complaints_count,
            "pending_complaints": pending_count,
            "resolved_complaints": resolved_count,
            "critical_complaints": critical_count,
            "total_workers": len(all_workers),
            "active_workers_count": sum(1 for w in all_workers if w.get("availability")),
            "verification_verified": sum(1 for v in all_verifications if v.get("ai_result") == "Verified"),
            "citizen_responses": len(all_feedbacks)
        },
        "category_distribution": categories,
        "recent_complaints": all_complaints[:10],
        "workers": worker_stats,
        "verifications": all_verifications[:5],
        "feedbacks": all_feedbacks[:5]
    }
