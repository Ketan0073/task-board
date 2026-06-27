from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, boards, tasks

app = FastAPI(title="Task Board API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://127.0.0.1:5173"
                   "https://task-board-ketan75.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(boards.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {"message": "Task Board API is running"}