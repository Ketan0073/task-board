from fastapi import APIRouter, Depends, HTTPException
from app.database import tasks_collection, boards_collection
from app.schemas import TaskCreate, TaskUpdate
from app.auth import get_current_user, require_admin
from bson import ObjectId
from datetime import datetime

router = APIRouter(tags=["Tasks"])

def fmt(task):
    task["id"] = str(task["_id"])
    task["board"] = str(task["board"])
    task["assignedTo"] = str(task["assignedTo"])
    task["createdBy"] = str(task["createdBy"])
    del task["_id"]
    return task

@router.post("/api/boards/{board_id}/tasks")
async def create_task(board_id: str, data: TaskCreate, current_user=Depends(get_current_user)):
    board = await boards_collection.find_one({"_id": ObjectId(board_id)})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if current_user["role"] != "admin" and ObjectId(current_user["id"]) not in board.get("members", []):
        raise HTTPException(status_code=403, detail="Access denied")
    task = {
        "title": data.title.strip(),
        "description": data.description,
        "status": data.status,
        "priority": data.priority,
        "dueDate": data.dueDate,
        "board": ObjectId(board_id),
        "assignedTo": ObjectId(data.assignedTo),
        "createdBy": ObjectId(current_user["id"]),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    result = await tasks_collection.insert_one(task)
    task["id"] = str(result.inserted_id)
    task["board"] = board_id
    task["assignedTo"] = data.assignedTo
    task["createdBy"] = current_user["id"]
    del task["_id"]
    return {"success": True, "data": task}

@router.get("/api/boards/{board_id}/tasks")
async def list_tasks(board_id: str, status: str = None, priority: str = None, assignedTo: str = None, current_user=Depends(get_current_user)):
    board = await boards_collection.find_one({"_id": ObjectId(board_id)})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if current_user["role"] != "admin" and ObjectId(current_user["id"]) not in board.get("members", []):
        raise HTTPException(status_code=403, detail="Access denied")
    query = {"board": ObjectId(board_id)}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if assignedTo:
        query["assignedTo"] = ObjectId(assignedTo)
    tasks = await tasks_collection.find(query).to_list(1000)
    return {"success": True, "data": [fmt(t) for t in tasks]}

@router.get("/api/tasks/{task_id}")
async def get_task(task_id: str, current_user=Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "data": fmt(task)}

@router.put("/api/tasks/{task_id}")
async def update_task(task_id: str, data: TaskUpdate, current_user=Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user["role"] == "admin":
        updates = {k: v for k, v in data.dict().items() if v is not None}
        if "assignedTo" in updates:
            updates["assignedTo"] = ObjectId(updates["assignedTo"])
    else:
        if str(task["assignedTo"]) != current_user["id"]:
            raise HTTPException(status_code=403, detail="You can only update your own tasks")
        updates = {}
        if data.status:
            updates["status"] = data.status
    updates["updatedAt"] = datetime.utcnow()
    await tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": updates})
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    return {"success": True, "data": fmt(task)}

@router.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, admin=Depends(require_admin)):
    result = await tasks_collection.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "data": {"message": "Task deleted"}}

@router.get("/api/admin/tasks")
async def admin_all_tasks(status: str = None, priority: str = None, admin=Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    tasks = await tasks_collection.find(query).to_list(1000)
    return {"success": True, "data": [fmt(t) for t in tasks]}