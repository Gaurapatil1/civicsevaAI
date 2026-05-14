import os
import logging
import asyncio
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

# ==========================================
# DATABASE CONFIGURATION & CONNECTION
# ==========================================

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "smart_city_ai")
USE_MOCK_DB = os.getenv("USE_MOCK_DB", "false").lower() == "true"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- IN-MEMORY MOCK DB (For Offline Demo) ---
class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = []

    async def insert_one(self, document):
        if "_id" not in document:
            document["_id"] = str(uuid.uuid4())
        self.data.append(document)
        return type('obj', (object,), {'inserted_id': document["_id"]})

    async def find_one(self, query):
        for item in self.data:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match: return item
        return None

    def find(self, query=None, projection=None):
        subset = []
        for item in self.data:
            if query is None or all(item.get(k) == v for k, v in query.items()):
                result = item.copy()
                if projection:
                    for k, v in projection.items():
                        if v == 0 and k in result: del result[k]
                subset.append(result)
        
        class Cursor:
            def __init__(self, items): self.items = items
            def sort(self, field, direction=-1):
                try:
                    self.items.sort(key=lambda x: x.get(field) or '', reverse=(direction == -1))
                except Exception: pass
                return self
            async def to_list(self, length=100): return self.items[:length]
        return Cursor(subset)

    async def update_one(self, query, update):
        return type('obj', (object,), {'modified_count': 1})

    async def delete_one(self, query):
        return type('obj', (object,), {'deleted_count': 1})

class MockDB:
    def __init__(self):
        self.collections = {}
    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]
    def __getattr__(self, name):
        return self.__getitem__(name)
    async def list_collection_names(self):
        return list(self.collections.keys())

# --- DATABASE INSTANCE ---
class Database:
    client = None
    db = None

db = Database()

async def connect_to_mongo():
    global db
    try:
        if USE_MOCK_DB:
            logger.info("🛠️  Running in MOCK MODE (Simulated DB)")
            try:
                # Try Atlas first
                db.client = AsyncIOMotorClient(
                    MONGO_URL, 
                    serverSelectionTimeoutMS=2000,
                    tlsAllowInvalidCertificates=True
                )
                db.db = db.client[DATABASE_NAME]
                await db.client.admin.command('ping')
                await seed_mock_data()
                logger.info("✅ Live Atlas Mock Database ready.")
            except Exception as e:
                logger.warning(f"⚠️ Atlas unreachable: {e}. Switching to OFFLINE Mock Mode.")
                db.db = MockDB()
                await seed_mock_data()
                logger.info("🚀 OFFLINE Mock Database (In-Memory) ready for demo.")
        else:
            logger.info(f"🔌 Connecting to MongoDB: {DATABASE_NAME}...")
            db.client = AsyncIOMotorClient(
                MONGO_URL, 
                serverSelectionTimeoutMS=20000,
                tlsAllowInvalidCertificates=True
            )
            db.db = db.client[DATABASE_NAME]
            await db.client.admin.command('ping')
            logger.info("✅ Connected to MongoDB successfully!")
    except Exception as e:
        if not USE_MOCK_DB:
            logger.error(f"❌ Could not connect to MongoDB: {e}")
            raise e

async def seed_mock_data():
    """Seeds the database with data from CSV files and standard demo users."""
    try:
        import pandas as pd
        import os
        from datetime import datetime

        # Paths
        base_path = os.path.dirname(os.path.abspath(__file__))
        complaints_path = os.path.join(base_path, "data", "complaints_dataset.csv")
        employees_path = os.path.join(base_path, "data", "municipality_employees.csv")

        # 1. Seed Admin User
        admin_email = "admin@gov.in"
        existing_admin = await db.db.users.find_one({"email": admin_email})
        if not existing_admin:
            await db.db.users.insert_one({
                "name": "Super Admin",
                "email": admin_email,
                "password": "123456",
                "role": "admin",
                "city": "Mumbai",
                "created_at": datetime.now()
            })

        # 2. Seed Workers from municipality_employees.csv
        if os.path.exists(employees_path):
            df_emp = pd.read_csv(employees_path)
            for _, row in df_emp.iterrows():
                worker_id = str(row["Employee ID"])
                existing = await db.db.workers.find_one({"worker_id": worker_id})
                if not existing:
                    import random
                    await db.db.workers.insert_one({
                        "worker_id": worker_id,
                        "name": row["Name"],
                        "department": row["Department"],
                        "designation": row["Designation"],
                        "contact": str(row["Contact"]),
                        "active_tasks": 0,
                        "avg_resolution_hours": round(random.uniform(4.0, 24.0), 1),
                        "avg_rating": round(random.uniform(3.5, 5.0), 1),
                        "availability": True,
                        "city": "Mumbai"
                    })

        # 3. Seed Complaints from complaints_dataset.csv
        if os.path.exists(complaints_path):
            df_comp = pd.read_csv(complaints_path)
            for idx, row in df_comp.head(50).iterrows():
                comp_id = f"CMP{idx+1000}"
                existing = await db.db.complaints.find_one({"_id": comp_id})
                if not existing:
                    worker = await db.db.workers.find_one({"department": row["category"]})
                    worker_data = None
                    if worker:
                        worker_data = {
                            "worker_id": worker["worker_id"],
                            "name": worker["name"],
                            "department": worker["department"],
                            "designation": worker["designation"]
                        }

                    await db.db.complaints.insert_one({
                        "_id": comp_id,
                        "citizen_name": "Citizen User",
                        "city": "Mumbai",
                        "message": row["complaint_text"],
                        "category": row["category"],
                        "priority": row["priority"],
                        "assigned_worker": worker_data,
                        "status": "Resolved" if idx % 3 == 0 else "Pending",
                        "created_at": datetime.now()
                    })

        # 4. Seed Verifications (AI/GPS)
        complaints = await db.db.complaints.find().to_list(10)
        for c in complaints:
            existing = await db.db.verifications.find_one({"complaint_id": str(c["_id"])})
            if not existing:
                await db.db.verifications.insert_one({
                    "complaint_id": str(c["_id"]),
                    "gps_status": "Location Verified",
                    "ai_result": "Verified" if c["status"] == "Resolved" else "In Progress",
                    "verified_at": datetime.now()
                })

        logger.info("✅ Mock Database populated with Dataset files.")
    except Exception as e:
        logger.error(f"Failed to seed dataset mock data: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("✅ MongoDB connection closed.")
