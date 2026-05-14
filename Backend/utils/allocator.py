import random

async def find_best_worker(db, category, priority):
    """
    Implements a weighted scoring allocation engine as per PRD2 Section 6.7.
    Formula balances Workload (50%), Historical Efficiency (30%), and Citizen Satisfaction (20%).
    """
    # 1. Filter workers by department matching category
    workers_cursor = db.workers.find({"dept": category, "status": "Available"})
    workers = await workers_cursor.to_list(length=100)
    
    if not workers:
        # Fallback: if no available in specific dept, find any available worker
        workers_cursor = db.workers.find({"status": "Available"})
        workers = await workers_cursor.to_list(length=100)
        
    if not workers:
        return None

    best_worker = None
    min_score = float('inf')

    for worker in workers:
        # Extract metrics with fallbacks
        active_tasks = float(worker.get("active_tasks", 0))
        avg_res_hours = float(worker.get("avg_resolution_hours", 24))
        avg_rating = float(worker.get("avg_rating", 4.0))
        
        # Load score (normalized: 0 to 5 tasks is common)
        load_score = active_tasks * 1.5
        
        # Efficiency score (normalized: 24h as 1.0)
        efficiency_score = (avg_res_hours / 24.0) * 1.0
        
        # Satisfaction score (penalty style: 5 - rating)
        satisfaction_score = (5.0 - avg_rating) * 1.0
        
        # Weighted Aggregation
        if priority in ["High", "Critical"]:
            # For critical tasks, prioritizing efficiency and satisfaction over load
            total_score = (load_score * 0.3) + (efficiency_score * 0.4) + (satisfaction_score * 0.3)
        else:
            # For routine tasks, prioritizing load balancing
            total_score = (load_score * 0.6) + (efficiency_score * 0.2) + (satisfaction_score * 0.2)
            
        print(f"DEBUG: Scored Worker {worker['name']} | Total: {total_score:.2f} | Rating: {avg_rating}")

        if total_score < min_score:
            min_score = total_score
            best_worker = worker

    return best_worker
