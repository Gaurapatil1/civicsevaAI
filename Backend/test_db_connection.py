import asyncio
from database import connect_to_mongo, close_mongo_connection, db
import logging

# ==========================================
# DATABASE CONNECTION TEST SCRIPT
# ==========================================

async def test_connection():
    """Stand-alone script to test the MongoDB connection."""
    try:
        # Attempt to connect
        await connect_to_mongo()
        
        # Perform a simple operation (list collections)
        collections = await db.db.list_collection_names()
        print(f"Connection Successful!")
        print(f"Available Collections: {collections}")
        
    except Exception as e:
        print(f"Connection Failed: {e}")
    finally:
        # Always close connection
        await close_mongo_connection()

if __name__ == "__main__":
    # Run the test
    asyncio.run(test_connection())
