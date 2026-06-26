from fastapi import APIRouter, HTTPException
from app.database import users_collection
from app.schemas import RegisterSchema, LoginSchema
from app.auth import hash_password, verify_password, create_token, get_current_user
from fastapi import Depends
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register")
async def register(data: RegisterSchema):
    existing = await users_collection.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "name": data.name.strip(),
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "role": "user",
        "createdAt": datetime.utcnow()
    }
    result = await users_collection.insert_one(user)
    return {"success": True, "data": {"id": str(result.inserted_id), "name": user["name"], "email": user["email"], "role": user["role"]}}

@router.post("/login")
async def login(data: LoginSchema):
    user = await users_collection.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"success": True, "data": {"token": token, "name": user["name"], "email": user["email"], "role": user["role"], "id": str(user["_id"])}}

@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return {"success": True, "data": {"id": current_user["id"], "name": current_user["name"], "email": current_user["email"], "role": current_user["role"]}}