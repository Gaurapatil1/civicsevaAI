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
    """
    Seeds initial data for demo based on PRD requirements.
    """
    try:
        # 1. Admin User
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
        
        # 1.1 Worker User
        worker_email = "worker@gov.in"
        existing_worker = await db.db.users.find_one({"email": worker_email})
        if not existing_worker:
            await db.db.users.insert_one({
                "name": "Amit Worker",
                "email": worker_email,
                "password": "worker123",
                "role": "worker",
                "city": "Mumbai",
                "created_at": datetime.now()
            })

        # 2. Field Workers
        if not await db.db.workers.find_one({"department": "Water"}):
            workers_list = [
                {"worker_id": "W001", "name": "Amit Patil", "department": "Water", "active_tasks": 1, "availability": True, "avg_resolution_hours": 5.0},
                {"worker_id": "W002", "name": "Rahul Deshmukh", "department": "Roads", "active_tasks": 3, "availability": False, "avg_resolution_hours": 12.0},
                {"worker_id": "W003", "name": "Priyanka Shinde", "department": "Waste Management", "active_tasks": 0, "availability": True, "avg_resolution_hours": 4.0},
            ]
            for w in workers_list:
                await db.db.workers.insert_one(w)

        # 3. Sample Complaints
        if not await db.db.complaints.find_one({}):
            complaints_list = [
                {
                    "citizen_name": "Rajesh Kumar",
                    "city": "Mumbai",
                    "category": "Water",
                    "priority": "Critical",
                    "status": "Resolved",
                    "message": "Major water pipe burst on Main Street.",
                    "created_at": datetime.now()
                }
            ]
            for c in complaints_list:
                await db.db.complaints.insert_one(c)

        # 4. Work Verifications (PRD Module 1 & 3)
        if not await db.db.verifications.find_one({}):
            await db.db.verifications.insert_one({
                "verification_id": "V_001",
                "complaint_id": "C_001",
                "worker_id": "W001",
                "gps_status": "Location Verified",
                "ai_result": "Verified",
                "image_path": "https://images.unsplash.com/photo-1541888946425-d81bb19480c5",
                "timestamp": datetime.now()
            })

        # 5. Citizen Feedback (PRD Module 4)
        if not await db.db.feedbacks.find_one({}):
            await db.db.feedbacks.insert_one({
                "feedback_id": "F_001",
                "complaint_id": "C_001",
                "citizen_response": "Work completed",
                "comment": "Thank you, street is much better now.",
                "timestamp": datetime.now()
            })
            
        logger.info("🌱 Database Seeded Successfully.")
    except Exception as e:
        logger.error(f"❌ Seeding Failed: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("✅ MongoDB connection closed.")
