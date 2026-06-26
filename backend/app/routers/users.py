from fastapi import APIRouter, Depends, HTTPException
from app.database import users_collection
from app.auth import require_admin
from bson import ObjectId

router = APIRouter(prefix="/api/users", tags=["Users"])

def fmt(user):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user["role"], "createdAt": user.get("createdAt")}

@router.get("")
async def list_users(admin=Depends(require_admin)):
    users = await users_collection.find().to_list(1000)
    return {"success": True, "data": [fmt(u) for u in users]}

@router.get("/{user_id}")
async def get_user(user_id: str, admin=Depends(require_admin)):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "data": fmt(user)}

@router.delete("/{user_id}")
async def delete_user(user_id: str, admin=Depends(require_admin)):
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "data": {"message": "User deleted"}}