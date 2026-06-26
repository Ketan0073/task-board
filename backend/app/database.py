from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.taskboard

users_collection = db.get_collection("users")
boards_collection = db.get_collection("boards")
tasks_collection = db.get_collection("tasks")