import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# ==========================================
# DATABASE CONFIGURATION & CONNECTION
# ==========================================

# Load environment variables
load_dotenv()

# Guide Parameters
# Supporting both MONGO_URL (from guide) and MONGODB_URL (legacy)
MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "smart_city_ai")
USE_MOCK_DB = os.getenv("USE_MOCK_DB", "false").lower() == "true"

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    """A simple class to hold the MongoDB client and database instance."""
    client: AsyncIOMotorClient = None
    db = None

# Single instance used across the app
db = Database()

async def connect_to_mongo():
    """
    Connects to MongoDB Atlas/Local or initializes Mock Mode.
    """
    try:
        if USE_MOCK_DB:
            logger.info("🛠️  Running in MOCK MODE (Simulated DB)")
            # In mock mode, we still initialize the client to the URL for "live-mocking" 
            # or it can be used for local testing.
            db.client = AsyncIOMotorClient(
                MONGO_URL, 
                serverSelectionTimeoutMS=20000,
                tlsAllowInvalidCertificates=True
            )
            db.db = db.client[DATABASE_NAME]
            
            # Seed mock data
            await seed_mock_data()
            logger.info("✅ Mock Database ready and seeded.")
        else:
            logger.info(f"🔌 Connecting to MongoDB: {DATABASE_NAME}...")
            if not MONGO_URL:
                raise ValueError("MONGO_URL not found in .env")
                
            db.client = AsyncIOMotorClient(
                MONGO_URL, 
                serverSelectionTimeoutMS=20000,
                tlsAllowInvalidCertificates=True
            )
            db.db = db.client[DATABASE_NAME]
            
            # Verify connection by pinging the server
            await db.client.admin.command('ping')
            logger.info("✅ Connected to MongoDB successfully!")
            
    except Exception as e:
        if USE_MOCK_DB:
            logger.warning(f"⚠️ Mock mode active, but connection failed: {e}. Standard operations may fail if live DB is expected.")
        else:
            logger.error(f"❌ Could not connect to MongoDB: {e}")
            raise e

async def seed_mock_data():
    """Seeds the mock database with test credentials and dummy records."""
    try:
        users_collection = db.db["users"]
        # Seed Administrator
        admin_email = "admin@gov.in"
        admin = await users_collection.find_one({"email": admin_email})
        if not admin:
            await users_collection.insert_one({
                "name": "Super Admin",
                "email": admin_email,
                "password": "123456",
                "role": "admin"
            })
            logger.info(f"🌱 Seeded Admin Account: {admin_email} / 123456")
        
        # Primary Collections Check (Ensure they exist)
        collections = ["users", "employees", "complaints", "task_logs", "analytics"]
        existing_cols = await db.db.list_collection_names()
        for col in collections:
            if col not in existing_cols:
                # Creating collection by inserting and deleting a dummy
                await db.db[col].insert_one({"init": True})
                await db.db[col].delete_one({"init": True})
                logger.info(f"📁 Initialized collection: {col}")
                
    except Exception as e:
        logger.error(f"Failed to seed mock data: {e}")

async def close_mongo_connection():
    """Closes the MongoDB connection."""
    if db.client:
        logger.info("🔌 Closing MongoDB connection...")
        db.client.close()
        logger.info("✅ MongoDB connection closed.")
