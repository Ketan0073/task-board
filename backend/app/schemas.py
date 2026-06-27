from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth ---
class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

# --- Board ---
class BoardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    members: Optional[List[str]] = []

class BoardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    members: Optional[List[str]] = None

# --- Task ---
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Todo"
    priority: Optional[str] = "Medium"
    dueDate: Optional[datetime] = None
    assignedTo: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    dueDate: Optional[datetime] = None
    assignedTo: Optional[str] = None