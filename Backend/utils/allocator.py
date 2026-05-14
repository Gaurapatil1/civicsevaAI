from database import db

# ==========================================
# SMART TASK ALLOCATION ENGINE (Prompt 8)
# ==========================================

async def find_best_worker(category: str):
    """
    Finds the best available municipal worker based on department and workload.
    
    Requirements:
    - Filter workers by department (matching complaint category)
    - Only consider workers who are 'available'
    - Calculate workload score using the formula:
      score = (active_tasks * 0.5) + (avg_resolution_hours * 0.3)
    - Assign the worker with the LOWEST score (least busy/most efficient).
    """
    
    # 1. Fetch available workers for the specific department
    # Note: We assume 'category' maps directly to 'department' in this simplistic model
    workers_cursor = db.db.workers.find({
        "department": category,
        "availability": True
    })
    workers = await workers_cursor.to_list(length=100)

    if not workers:
        # If no specific department worker is found, find any available worker as fallback
        print(f"No specific workers found for {category}. Searching for general availability...")
        workers_cursor = db.db.workers.find({"availability": True})
        workers = await workers_cursor.to_list(length=100)

    if not workers:
        return None

    # 2. Iterate and apply workload formula
    best_worker = None
    min_score = float('inf')

    for worker in workers:
        # Extract metrics
        active_tasks = float(worker.get("active_tasks", 0))
        avg_resolution_hours = float(worker.get("avg_resolution_hours", 0.0))
        
        # FORMULA: score = (active_tasks * 0.5) + (avg_resolution_hours * 0.3)
        # Detailed Comments:
        # - active_tasks is weighted 0.5 to prioritize current LOAD.
        # - avg_resolution_hours is weighted 0.3 to factor in EFFICIENCY.
        # Lower total score indicates a better candidate for a new task.
        
        workload_score = (active_tasks * 0.5) + (avg_resolution_hours * 0.3)
        
        print(f"Worker: {worker['name']}, Score: {workload_score}")

        if workload_score < min_score:
            min_score = workload_score
            best_worker = worker

    return best_worker
