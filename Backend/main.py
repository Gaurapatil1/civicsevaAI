from fastapi import FastAPI
from database import connect_to_mongo, close_mongo_connection

# ==========================================
# FASTAPI APPLICATION INITIALIZATION
# ==========================================

# Import routers
from routes import complaints, dashboard

app = FastAPI(
    title="CivicSevaAI Backend",
    description="The backend API for CivicSevaAI - Municipal Grievance Management System",
    version="1.0.0"
)

# Startup event to initialize database connection
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

# Shutdown event to clean up database connection
@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include Routers
app.include_router(complaints.router)
app.include_router(dashboard.router)

# Root endpoint for health check
@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to CivicSevaAI API",
        "docs": "/docs"
    }

# ==========================================
# ROUTE REGISTRATION (To be added)
# ==========================================
