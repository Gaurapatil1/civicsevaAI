from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegistration(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    city: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: str
    role: str = "citizen"
