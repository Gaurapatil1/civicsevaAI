import os
import random
import pandas as pd
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "civicseva_db"

class Database:
    def __init__(self):
        self.client = None
        self.db = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGO_URI)
    db.db = db.client[DB_NAME]
    print(f"✅ Connected to MongoDB: {MONGO_URI}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB.")

async def seed_data():
    """Seeds the database with real dataset and demo users."""
    if db.db is None:
        await connect_to_mongo()
        
    try:
        # 1. Clear existing demo data
        await db.db.workers.delete_many({})
        await db.db.users.delete_many({})
        # Note: We keep complaints to avoid clearing user submissions during testing
        
        # 2. Seed Workers from municipality_employees.csv
        base_path = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_path, "data", "municipality_employees.csv")
        
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            workers_list = []
            for _, row in df.iterrows():
                dept = row['Department']
                # Categorization logic
                if 'Water' in str(dept): d = "Water Supply"
                elif 'Electricity' in str(dept): d = "Electricity"
                elif 'Waste' in str(dept): d = "Waste Management"
                elif 'Road' in str(dept): d = "Roads/Potholes"
                else: d = "Sanitation"

                workers_list.append({
                    "name": row['Name'],
                    "email": str(row['Email']).lower(),
                    "role": "worker",
                    "dept": d,
                    "password": "hashed_password",
                    "status": "Available" if random.random() > 0.3 else "On Duty",
                    "active_tasks": random.randint(0, 3),
                    "avg_rating": round(random.uniform(3.8, 5.0), 1),
                    "avg_resolution_hours": random.randint(4, 48),
                    "total_completed": random.randint(10, 100)
                })
            
            if workers_list:
                await db.db.workers.insert_many(workers_list[:40])
                print(f"✅ Seeded {len(workers_list[:40])} workers from employees dataset.")

        # 3. Seed Admin and Test Worker Account
        await db.db.users.insert_many([
            {
                "name": "Chief Administrator",
                "email": "admin@civicseva.gov",
                "password": "123", # For demo simplicity
                "role": "admin",
                "city": "Mumbai"
            },
            {
                "name": "Amit Pawar",
                "email": "amit.pawar@municipal.gov",
                "password": "123",
                "role": "worker",
                "dept": "Water Supply",
                "city": "Mumbai"
            }
        ])
        
        # 4. Seed Random Complaints for History
        complaints_csv = os.path.join(base_path, "data", "complaints_dataset.csv")
        if os.path.exists(complaints_csv):
            df_c = pd.read_csv(complaints_csv)
            sample_c = df_c.sample(min(20, len(df_c)))
            seeded_c = []
            for _, row in sample_c.iterrows():
                seeded_c.append({
                    "citizen_name": "Citizen User",
                    "message": row['Complaint Text'],
                    "category": random.choice(["Water Supply", "Waste Management", "Electricity", "Roads/Potholes", "Sanitation"]),
                    "priority": random.choice(["Low", "Medium", "High", "Critical"]),
                    "status": "Pending",
                    "city": "Mumbai",
                    "created_at": datetime.now(),
                    "assigned_worker": None
                })
            
            # Explicitly assigned tasks to Amit Pawar (Test Worker)
            amit_worker = {
                "worker_id": "amit_id", 
                "name": "Amit Pawar", 
                "department": "Water Supply"
            }
            if len(seeded_c) > 3:
                for i in range(4):
                    seeded_c[i]["assigned_worker"] = amit_worker
                    seeded_c[i]["status"] = "Pending"

            if seeded_c:
                await db.db.complaints.insert_many(seeded_c)

        print("✅ Database Seeding Complete.")
    except Exception as e:
        print(f"❌ Seeding Error: {e}")
