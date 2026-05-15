# Auto-reload trigger
import os
import uuid
import random
import pandas as pd
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
try:
    from mongomock_motor import AsyncMongoMockClient
except ImportError:
    AsyncMongoMockClient = None
from dotenv import load_dotenv

load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
USE_MOCK_DB = os.getenv("USE_MOCK_DB", "true").lower() == "true"
DB_NAME = "civicseva_db"

class Database:
    def __init__(self):
        self.client = None
        self.db = None

db = Database()

async def connect_to_mongo():
    if USE_MOCK_DB and AsyncMongoMockClient:
        db.client = AsyncMongoMockClient()
        print("✅ Connected to MOCK MongoDB.")
    else:
        db.client = AsyncIOMotorClient(MONGO_URI)
        print(f"✅ Connected to MongoDB: {MONGO_URI}")
    
    db.db = db.client[DB_NAME]

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB.")

async def seed_data():
    """Seeds the database with real dataset and demo users."""
    if db.db is None:
        await connect_to_mongo()
        
    try:
        # Check if we need to seed workers specifically
        worker_count = await db.db.workers.count_documents({})
        if worker_count == 0:
            print("🌱 Seeding workers database...")
            # (Seeding logic for workers)
        else:
            print("🚀 Workers already seeded.")

        # Check if we need to seed demo users
        user_count = await db.db.users.count_documents({})
        if user_count == 0:
            print("🌱 Seeding demo users...")
            # (Seeding logic for users)
        else:
            print("🚀 Users already seeded.")
            return # Skip entire seed if users exist to avoid duplicates
        # (Rest of the seeding logic continues safely because we confirmed it's empty)
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
                    "password": "1234", # Set a universal simple password for demo ease
                    "status": "Available" if random.random() > 0.3 else "On Duty",
                    "active_tasks": random.randint(0, 3),
                    "avg_rating": round(random.uniform(3.8, 5.0), 1),
                    "avg_resolution_hours": random.randint(4, 48),
                    "total_completed": random.randint(10, 100)
                })
            
            
            if workers_list:
                await db.db.workers.insert_many(workers_list[:40])
                print(f"✅ Seeded {len(workers_list[:40])} workers from employees dataset.")

        # 3. ALWAYS ensure demo Admin, Worker, and Citizens exist (Upsert)
        demo_users = [
            { "name": "Ketan Patil", "email": "ketanpatil@gmail.com", "password": "1234", "role": "admin", "city": "Mumbai" },
            { "name": "Kiran Patil", "email": "kiranpatil@gmail.com", "password": "1234", "role": "worker", "dept": "Water Supply", "city": "Mumbai" },
            { "name": "Rohit Joshi", "email": "rohit.joshi@municipal.gov", "password": "1234", "role": "worker", "dept": "Electricity", "city": "Mumbai" },
            { "name": "Amit Pawar", "email": "amit.pawar@gmail.com", "password": "1234", "role": "citizen" },
            { "name": "Sonal Mehta", "email": "sonal.mehta@gmail.com", "password": "1234", "role": "citizen" },
            { "name": "Vikram Singh", "email": "vikram.singh@gmail.com", "password": "1234", "role": "citizen" },
            { "name": "Anita K", "email": "anita.k@gmail.com", "password": "1234", "role": "citizen" },
            { "name": "Rajesh T", "email": "rajesh.t@gmail.com", "password": "1234", "role": "citizen" },
            { "name": "Sneha P", "email": "sneha.p@gmail.com", "password": "1234", "role": "citizen" }
        ]
        
        for u in demo_users:
            await db.db.users.update_one({"email": u["email"]}, {"$set": u}, upsert=True)
            
        # Also ensure Kiran is in the workers collection for the allocator
        kiran_worker = {
            "worker_id": "demo_worker_kiran",
            "name": "Kiran Patil",
            "email": "kiranpatil@gmail.com",
            "role": "worker",
            "dept": "Water Supply",
            "password": "1234",
            "status": "Available",
            "active_tasks": 0,
            "avg_rating": 4.9,
            "avg_resolution_hours": 1,
            "total_completed": 0
        }
        await db.db.workers.update_one({"email": kiran_worker["email"]}, {"$set": kiran_worker}, upsert=True)
        
        rohit_worker = {
            "worker_id": "demo_worker_rohit",
            "name": "Rohit Joshi",
            "email": "rohit.joshi@municipal.gov",
            "role": "worker",
            "dept": "Electricity",
            "password": "1234",
            "status": "Available",
            "active_tasks": 1,
            "avg_rating": 4.5,
            "avg_resolution_hours": 3,
            "total_completed": 5
        }
        await db.db.workers.update_one({"email": rohit_worker["email"]}, {"$set": rohit_worker}, upsert=True)
        
        print("✅ Core demo accounts verified and ready.")
        
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
            
            # Seed 6 diverse tasks from 6 different citizens
            demo_tasks = [
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Amit Pawar",
                    "city": "Mumbai",
                    "message": "Large pothole in the middle of the road near Dadar Chowpatty, dangerous for bikers.",
                    "category": "Roads/Potholes",
                    "priority": "High",
                    "status": "Pending",
                    "assigned_worker": None,
                    "created_at": datetime.utcnow(),
                    "completion_image": None,
                    "rating": None
                },
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Sonal Mehta",
                    "city": "Mumbai",
                    "message": "Entire street lighting is off near Juhu Garden, very dark at night.",
                    "category": "Electricity",
                    "priority": "Medium",
                    "status": "Pending",
                    "assigned_worker": None,
                    "created_at": datetime.utcnow(),
                    "completion_image": None,
                    "rating": None
                },
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Vikram Singh",
                    "city": "Mumbai",
                    "message": "Garbage pile has not been cleared for 4 days in Kandivali East Sector 2.",
                    "category": "Waste Management",
                    "priority": "Low",
                    "status": "Pending",
                    "assigned_worker": None,
                    "created_at": datetime.utcnow(),
                    "completion_image": None,
                    "rating": None
                },
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Anita Kulkarni",
                    "city": "Mumbai",
                    "message": "Muddy water coming from kitchen taps since morning in Borivali West.",
                    "category": "Water Supply",
                    "priority": "Critical",
                    "status": "Pending",
                    "assigned_worker": { "worker_id": "demo_worker_kiran", "name": "Kiran Patil", "department": "Water Supply" },
                    "created_at": datetime.utcnow(),
                    "completion_image": None,
                    "rating": None
                },
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Rajesh Tawade",
                    "city": "Mumbai",
                    "message": "Power fluctuation causing damage to electronic appliances in Mulund area.",
                    "category": "Electricity",
                    "priority": "High",
                    "status": "Pending",
                    "assigned_worker": None,
                    "created_at": datetime.utcnow(),
                    "completion_image": None,
                    "rating": None
                },
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Sanjay Patil",
                    "city": "Mumbai",
                    "message": "Major water pipe burst near Marine Drive, wasting thousands of liters.",
                    "category": "Water Supply",
                    "priority": "High",
                    "status": "Resolved",
                    "assigned_worker": { "worker_id": "demo_worker_kiran", "name": "Kiran Patil", "department": "Water Supply" },
                    "created_at": datetime.utcnow(),
                    "resolved_at": datetime.utcnow(),
                    "completion_note": "Pipe repaired with heavy duty sealant and pressure verified.",
                    "completion_image": "https://images.unsplash.com/photo-1542013936693-884638324262?q=80&w=600",
                    "rating": 5
                },
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Deepak More",
                    "city": "Mumbai",
                    "message": "Street light has been flickering and then stopped working in Bandra West.",
                    "category": "Electricity",
                    "priority": "Medium",
                    "status": "In Progress",
                    "assigned_worker": { "worker_id": "demo_worker_rohit", "name": "Rohit Joshi", "department": "Electricity" },
                    "created_at": datetime.utcnow(),
                    "completion_image": None,
                    "rating": None
                },
                {
                    "_id": str(uuid.uuid4()),
                    "citizen_name": "Megha Jadhav",
                    "city": "Mumbai",
                    "message": "Frequent illegal waste dumping in the colony park area.",
                    "category": "Waste Management",
                    "priority": "Low",
                    "status": "Pending",
                    "assigned_worker": None,
                    "created_at": datetime.utcnow(),
                    "completion_image": None,
                    "rating": None
                },
            ]
            # 4. ALWAYS ensure core demo tasks exist (Upsert by message/name)
            for task in demo_tasks:
                await db.db.complaints.update_one(
                    {"citizen_name": task["citizen_name"], "message": task["message"]},
                    {"$set": task},
                    upsert=True
                )
            print("✅ Core demo tasks verified (including Sanjay Patil).")

        print("✅ Database Seeding Complete.")
    except Exception as e:
        print(f"❌ Seeding Error: {e}")
