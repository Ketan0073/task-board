# TaskBoard — Full Stack Task Management App

A full-stack task management and collaboration board built with React, FastAPI, and MongoDB.

##  Live Links

- **Frontend:** https://task-board-ketan75.vercel.app
- **Backend API:** https://task-board-api-hw2u.onrender.com
- **API Docs:** https://task-board-api-hw2u.onrender.com/docs
- **GitHub:** https://github.com/Ketan0073/task-board

##  Tech Stack

- **Frontend:** React, Redux Toolkit, React Router v6, Tailwind CSS, Axios
- **Backend:** FastAPI, Python, Uvicorn
- **Database:** MongoDB Atlas (Motor async driver)
- **Auth:** JWT (python-jose), bcrypt password hashing
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

##  Features

- JWT-based authentication (register, login, protected routes)
- Role-based access: Admin and User roles
- Admin can create/delete boards and assign members
- Admin can create/delete/update tasks
- Kanban board with 3 columns: Todo, In Progress, Done
- Color-coded priority badges: Low (green), Medium (amber), High (red)
- Task detail modal with due date, description, assignee
- Admin pages: manage all users and boards
- Fully responsive at 768px+

##  Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# JWT_EXPIRE_MINUTES=60
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

##  API Endpoints

| Method | Endpoint              | Description       | Auth    |
|--------|-----------------------|-------------------|---------|
| POST   | /api/auth/register    | Register new user | Public  |
| POST   | /api/auth/login       | Login             | Public  |
| GET    | /api/auth/me          | Get current user  | User    |
| GET    | /api/users            | List all users    | Admin   |
| DELETE | /api/users/:id        | Delete user       | Admin   |
| POST   | /api/boards           | Create board      | Admin   |
| GET    | /api/boards           | List boards       | User    |
| GET    | /api/boards/:id       | Get board         | User    |
| PUT    | /api/boards/:id       | Update board      | Admin   |
| DELETE | /api/boards/:id       | Delete board      | Admin   |
| POST   | /api/boards/:id/tasks | Create task       | Admin   |
| GET    | /api/boards/:id/tasks | List tasks        | User    |
| PUT    | /api/tasks/:id        | Update task       | User    |
| DELETE | /api/tasks/:id        | Delete task       | Admin   |