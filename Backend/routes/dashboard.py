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

    try:
        # 1. Fetch complaints
        complaints_cursor = db.db.complaints.find().sort("created_at", -1)
        all_complaints = await complaints_cursor.to_list(length=500)
        all_complaints = [c for c in all_complaints if c is not None]

        # 2. Fetch ALL workers
        workers_cursor = db.db.workers.find({})
        all_workers = await workers_cursor.to_list(length=1000)
        all_workers = [w for w in all_workers if w is not None]

        # 3. Calculate Analytics
        total_complaints_count = len(all_complaints)
        pending_count = sum(1 for c in all_complaints if (c.get("status") or "").lower() == "pending")
        resolved_count = sum(1 for c in all_complaints if (c.get("status") or "").lower() == "resolved")
        critical_count = sum(1 for c in all_complaints if (c.get("priority") or "").lower() in ["critical", "high"])
        
        # Category distribution
        categories = {}
        for c in all_complaints:
            cat = c.get("category", "General")
            categories[cat] = categories.get(cat, 0) + 1

        # Worker summary with safety checks
        worker_stats = []
        for w in all_workers:
            # Count tasks assigned to this worker
            worker_id = w.get("worker_id")
            assigned_tasks = 0
            if worker_id:
                assigned_tasks = sum(1 for c in all_complaints if (c.get("assigned_worker") or {}).get("worker_id") == worker_id)
            
            worker_stats.append({
                "name": w.get("name", "Unknown Worker"),
                "dept": w.get("department", "General"),
                "tasks": assigned_tasks,
                "status": "Available" if w.get("availability") else "On Field",
                "id": worker_id
            })

        # 5. Verifications & Feedback
        all_verifications = await db.db.verifications.find({}).to_list(length=100)
        all_verifications = [v for v in all_verifications if v is not None]
        
        # Calculate Average Rating from recent complaints that have a rating
        rated_complaints = [c for c in all_complaints if c.get("rating") is not None]
        avg_satisfaction = sum(c["rating"] for c in rated_complaints) / len(rated_complaints) if rated_complaints else 4.2

        # 6. Final Response
        return {
            "analytics": {
                "total_complaints": total_complaints_count,
                "pending_complaints": pending_count,
                "resolved_complaints": resolved_count,
                "critical_complaints": critical_count,
                "total_workers": len(all_workers),
                "active_workers_count": sum(1 for w in all_workers if w.get("availability")),
                "verification_verified": sum(1 for v in all_verifications if (v.get("ai_result") or "").lower() == "verified"),
                "citizen_satisfaction": round(avg_satisfaction, 1)
            },
            "category_distribution": categories,
            "recent_complaints": all_complaints[:20],
            "workers": worker_stats,
            "verifications": all_verifications[:10],
            "feedbacks": rated_complaints[:10] # Show complaints with feedback
        }
    except Exception as e:
        print(f"Dashboard Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
