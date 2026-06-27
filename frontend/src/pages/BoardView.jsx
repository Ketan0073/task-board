import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/common/Navbar'
import Spinner from '../components/common/Spinner'
import api from '../api'

const STATUSES = ['Todo', 'In Progress', 'Done']

const PRIORITY_COLORS = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
}

export default function BoardView() {
  const { boardId } = useParams()
  const { user } = useSelector((s) => s.auth)
  const [board, setBoard] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assignedTo: '', dueDate: '' })
  const [error, setError] = useState('')

  const fetchAll = async () => {
    try {
      const [b, t] = await Promise.all([
        api.get(`/api/boards/${boardId}`),
        api.get(`/api/boards/${boardId}/tasks`)
      ])
      setBoard(b.data.data)
      setTasks(t.data.data)
      if (user.role === 'admin') {
        const u = await api.get('/api/users')
        setUsers(u.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [boardId])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/api/boards/${boardId}/tasks`, form)
      setForm({ title: '', description: '', priority: 'Medium', status: 'Todo', assignedTo: '', dueDate: '' })
      setShowCreate(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    await api.put(`/api/tasks/${taskId}`, { status: newStatus })
    fetchAll()
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    await api.delete(`/api/tasks/${taskId}`)
    fetchAll()
  }

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><Spinner /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{board?.title}</h1>
            {board?.description && <p className="text-sm text-gray-500 mt-1">{board.description}</p>}
          </div>
          {user.role === 'admin' && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm"
            >
              {showCreate ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {showCreate && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
            {error && <p className="bg-red-100 text-red-600 px-3 py-2 rounded mb-3 text-sm">{error}</p>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  required
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUSES.map(status => (
            <div key={status} className="bg-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">{status}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {tasksByStatus(status).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasksByStatus(status).map(task => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800 text-sm">{task.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
                    {user.role === 'admin' && (
                      <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 flex-1"
                        >
                          <option>Todo</option>
                          <option>In Progress</option>
                          <option>Done</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Del
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {tasksByStatus(status).length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-gray-800">{selectedTask.title}</h2>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[selectedTask.priority]}`}>
                    {selectedTask.priority}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {selectedTask.status}
                  </span>
                </div>
                {selectedTask.description && (
                  <p className="text-gray-600">{selectedTask.description}</p>
                )}
                {selectedTask.dueDate && (
                  <p className="text-gray-500">Due: {new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="mt-6 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}