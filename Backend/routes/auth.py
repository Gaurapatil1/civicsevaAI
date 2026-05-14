from fastapi import APIRouter, HTTPException, status
from models.user import UserRegistration, UserLogin, UserInfo
from database import db
from datetime import datetime
import bcrypt
import uuid
import logging

# Setup logging for this module
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing utilities using direct bcrypt
def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt."""
    salt = bcrypt.gensalt()
    # Encoding to utf-8 as bcrypt requires bytes
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a bcrypt hash."""
    try:
        # Convert strings back to bytes for comparison
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        # Fallback for plain text comparison (useful during development/seeding)
        return plain_password == hashed_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ==========================================
# 1. USER REGISTRATION API
# ==========================================
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegistration):
    """
    Handles new citizen registration.
    Checks for duplicates, hashes passwords, and stores user data.
    """
    logger.info(f"Registration request received for email: {user.email}")
    
    # Check if database is connected
    if db.db is None:
        logger.error("Database connection failed during registration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Database not connected."
        )
    
    try:
        # Step 1: Check if user already exists based on email
        # Requirement: Check MongoDB users collection properly
        existing_user = await db.db.users.find_one({"email": user.email})
        
        if existing_user:
            logger.warning(f"Duplicate email detected: {user.email}")
            # Requirement: Return proper JSON response for duplicate email
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Registration failed. This email is already registered."
            )
        
        # Step 2: Hash the password using bcrypt
        hashed_password = hash_password(user.password)
        
        # Step 3: Create the user document
        # Requirement: Store name, email, city, password_hash, created_at
        new_user = {
            "_id": str(uuid.uuid4()),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "city": user.city,
            "password_hash": hashed_password, # Storing the hash, not plain text
            "role": "citizen",
            "created_at": datetime.utcnow()
        }
        
        # Step 4: Insert into MongoDB
        await db.db.users.insert_one(new_user)
        logger.info(f"User {user.email} inserted successfully into MongoDB.")
        
        return {
            "status": "success",
            "message": "User registered successfully", 
            "user_id": new_user["_id"]
        }

    except HTTPException as he:
        # Re-raise HTTP exceptions (like the duplicate email one)
        raise he
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during registration."
        )

# ==========================================
# 2. USER LOGIN API
# ==========================================
@router.post("/login")
async def login_user(user: UserLogin):
    """
    Handles user login by verifying hashed password.
    """
    logger.info(f"Login attempt for: {user.email}")
    
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")
    
    # Find user by email
    found_user = await db.db.users.find_one({"email": user.email})
    
    # Requirement: Verify password hash (must handle both plain and hashed for migration safety if needed, but here we assume bcrypt)
    if not found_user:
        logger.warning(f"Login failed: User {user.email} not found")
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Check password (supporting both 'password' and 'password_hash' fields for compatibility)
    stored_password = found_user.get("password_hash") or found_user.get("password")
    
    if not stored_password:
         raise HTTPException(status_code=401, detail="Invalid credentials.")

    try:
        # If it's a bcrypt hash, verify it
        is_valid = verify_password(user.password, stored_password)
    except Exception:
        # Fallback for plain text comparison (useful during development/seeding)
        is_valid = (user.password == stored_password)

    if not is_valid:
        logger.warning(f"Login failed: Incorrect password for {user.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    logger.info(f"User {user.email} logged in successfully.")
    return {
        "message": "Login successful",
        "user": {
            "name": found_user["name"],
            "email": found_user["email"],
            "phone": found_user.get("phone", "N/A"),
            "role": found_user.get("role", "citizen"),
            "city": found_user.get("city", "N/A")
        },
        "token": "fake-jwt-token-for-demo"
    }

# ==========================================
# 3. TEST USERS API (Requirement 8)
# ==========================================
@router.get("/test-users")
async def get_test_users():
    """
    Helper endpoint to verify users stored in MongoDB.
    """
    if db.db is None:
        raise HTTPException(status_code=500, detail="Database not connected.")
    
    users_cursor = db.db.users.find({}, {"password_hash": 0, "password": 0})
    users_list = await users_cursor.to_list(length=100)
    
    return {
        "total_users": len(users_list),
        "users": users_list
    }
