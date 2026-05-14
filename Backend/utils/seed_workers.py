import pandas as pd
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path to allow absolute imports if needed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# ==========================================
# WORKER DATASET SEEDER
# ==========================================

# Load environment variables
load_dotenv()
MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "smart_city_ai")

async def seed_workers():
    """
    Reads workers from CSV and inserts into MongoDB 'workers' collection.
    Checks for duplicates based on 'worker_id' before insertion.
    """
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    collection = db["workers"]

    # Define CSV path relative to this script
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "municipality_employees.csv")
    
    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        return

    # Load worker records using pandas
    df = pd.read_csv(csv_path)

    # Department Mapping for AI Prediction Consistency
    dept_map = {
        "Water Supply": "Water",
        "Electrical Department": "Electricity",
        "Sanitation": "Sanitation",
        "Solid Waste Management": "Sanitation",
        "Roads & Infrastructure": "Roads"
    }

    inserted_count = 0
    print("Starting seeding process with new employee dataset...")

    for _, row in df.iterrows():
        # Map new CSV columns to our database schema
        raw_dept = row['Department']
        mapped_dept = dept_map.get(raw_dept, raw_dept) # Fallback to original if not in map

        worker_data = {
            "worker_id": row['Employee ID'],
            "name": row['Name'],
            "department": mapped_dept,
            "designation": row['Designation'],
            "contact": row['Contact'],
            "email": row['Email'],
            # Default values for allocation engine
            "active_tasks": 0,
            "avg_resolution_hours": 2.5,
            "availability": True
        }
        
        # Check for duplicate worker_id
        existing_worker = await collection.find_one({"worker_id": worker_data["worker_id"]})
        
        if not existing_worker:
            await collection.insert_one(worker_data)
            inserted_count += 1
            print(f"SUCCESS: Inserted employee {worker_data['name']} (ID: {worker_data['worker_id']})")
        else:
            print(f"SKIP: Employee with ID {worker_data['worker_id']} already exists.")

    print("-" * 30)
    print(f"Seeding process finished.")
    print(f"Total new employees inserted: {inserted_count}")
    print("-" * 30)
    
    # Close connection
    client.close()

if __name__ == "__main__":
    # Execute the async seeding function
    asyncio.run(seed_workers())
