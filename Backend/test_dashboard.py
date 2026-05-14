import os
import asyncio
import sys

# Mocking the environment
os.environ['USE_MOCK_DB'] = 'true'
sys.path.append(os.getcwd())

from database import connect_to_mongo, db
from routes.dashboard import get_dashboard_analytics

async def test_dashboard():
    print("Connecting to DB...")
    await connect_to_mongo()
    print("DB Connected. Fetching stats...")
    try:
        stats = await get_dashboard_analytics()
        print("Stats fetched successfully!")
        print(f"Total Complaints: {stats['analytics']['total_complaints']}")
    except Exception as e:
        print(f"Error fetching stats: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_dashboard())
