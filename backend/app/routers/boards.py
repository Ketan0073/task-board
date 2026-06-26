from fastapi import APIRouter, Depends, HTTPException
from app.database import boards_collection, tasks_collection
from app.schemas import BoardCreate, BoardUpdate
from app.auth import get_current_user, require_admin
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/boards", tags=["Boards"])

def fmt(board):
    board["id"] = str(board["_id"])
    board["owner"] = str(board["owner"])
    board["members"] = [str(m) for m in board.get("members", [])]
    del board["_id"]
    return board

@router.post("")
async def create_board(data: BoardCreate, admin=Depends(require_admin)):
    board = {
        "title": data.title.strip(),
        "description": data.description,
        "owner": ObjectId(admin["id"]),
        "members": [ObjectId(m) for m in data.members],
        "createdAt": datetime.utcnow()
    }
    result = await boards_collection.insert_one(board)
    board["id"] = str(result.inserted_id)
    board["owner"] = str(board["owner"])
    board["members"] = [str(m) for m in board["members"]]
    del board["_id"]
    return {"success": True, "data": board}

@router.get("")
async def list_boards(current_user=Depends(get_current_user)):
    if current_user["role"] == "admin":
        boards = await boards_collection.find().to_list(1000)
    else:
        boards = await boards_collection.find({"members": ObjectId(current_user["id"])}).to_list(1000)
    return {"success": True, "data": [fmt(b) for b in boards]}

@router.get("/{board_id}")
async def get_board(board_id: str, current_user=Depends(get_current_user)):
    board = await boards_collection.find_one({"_id": ObjectId(board_id)})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if current_user["role"] != "admin" and ObjectId(current_user["id"]) not in board.get("members", []):
        raise HTTPException(status_code=403, detail="Access denied")
    return {"success": True, "data": fmt(board)}

@router.put("/{board_id}")
async def update_board(board_id: str, data: BoardUpdate, admin=Depends(require_admin)):
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if "members" in updates:
        updates["members"] = [ObjectId(m) for m in updates["members"]]
    await boards_collection.update_one({"_id": ObjectId(board_id)}, {"$set": updates})
    board = await boards_collection.find_one({"_id": ObjectId(board_id)})
    return {"success": True, "data": fmt(board)}

@router.delete("/{board_id}")
async def delete_board(board_id: str, admin=Depends(require_admin)):
    await tasks_collection.delete_many({"board": ObjectId(board_id)})
    result = await boards_collection.delete_one({"_id": ObjectId(board_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Board not found")
    return {"success": True, "data": {"message": "Board and its tasks deleted"}}

@router.post("/{board_id}/members")
async def add_member(board_id: str, body: dict, admin=Depends(require_admin)):
    user_id = body.get("userId")
    await boards_collection.update_one({"_id": ObjectId(board_id)}, {"$addToSet": {"members": ObjectId(user_id)}})
    return {"success": True, "data": {"message": "Member added"}}

@router.delete("/{board_id}/members/{user_id}")
async def remove_member(board_id: str, user_id: str, admin=Depends(require_admin)):
    await boards_collection.update_one({"_id": ObjectId(board_id)}, {"$pull": {"members": ObjectId(user_id)}})
    return {"success": True, "data": {"message": "Member removed"}}