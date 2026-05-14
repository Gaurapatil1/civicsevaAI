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
    
    Returns:
    - total complaints
    - available workers count
    - critical complaints count
    - latest complaints list
    """
    
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")

    # 1. Fetch all complaints
    complaints_cursor = db.db.complaints.find().sort("created_at", -1)
    all_complaints = await complaints_cursor.to_list(length=100)

    # 2. Fetch all available workers
    workers_cursor = db.db.workers.find({"availability": True})
    available_workers = await workers_cursor.to_list(length=100)

    # 3. Calculate Analytics
    total_complaints_count = len(all_complaints)
    
    # Count specific priorities
    critical_count = sum(1 for c in all_complaints if c.get("priority") == "Critical")
    high_count = sum(1 for c in all_complaints if c.get("priority") == "High")
    
    # Category distribution
    categories = {}
    for c in all_complaints:
        cat = c.get("category", "Unknown")
        categories[cat] = categories.get(cat, 0) + 1

    # 4. Prepare Dashboard JSON
    dashboard_data = {
        "analytics": {
            "total_complaints": total_complaints_count,
            "critical_complaints": critical_count,
            "high_priority_complaints": high_count,
            "active_workers_count": len(available_workers)
        },
        "category_distribution": categories,
        "recent_complaints": all_complaints[:5], # Return only 5 latest for dashboard summary
        "available_workers_summary": [
            {"name": w["name"], "dept": w["department"]} for w in available_workers[:5]
        ]
    }

    return dashboard_data
