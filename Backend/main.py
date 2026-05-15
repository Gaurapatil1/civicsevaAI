from fastapi import FastAPI
from database import connect_to_mongo, close_mongo_connection, seed_data

# ==========================================
# FASTAPI APPLICATION INITIALIZATION
# ==========================================

# Import routers
from routes import complaints, dashboard, auth, worker
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CivicSevaAI Backend",
    description="The backend API for CivicSevaAI - Municipal Grievance Management System",
    version="1.0.0"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Startup event to initialize database connection
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    await seed_data()

# Shutdown event to clean up database connection
@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include Routers
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(dashboard.router)
app.include_router(worker.router)

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
