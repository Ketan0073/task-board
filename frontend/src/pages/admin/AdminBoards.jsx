import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import api from '../../api'

export default function AdminBoards() {
  const [boards, setBoards] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', members: [] })
  const [error, setError] = useState('')

  const fetchData = async () => {
    const [b, u] = await Promise.all([api.get('/api/boards'), api.get('/api/users')])
    setBoards(b.data.data)
    setUsers(u.data.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/boards', form)
      setForm({ title: '', description: '', members: [] })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create board')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this board and all its tasks?')) return
    await api.delete(`/api/boards/${id}`)
    fetchData()
  }

  const toggleMember = (userId) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter(m => m !== userId)
        : [...f.members, userId]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Boards</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm"
          >
            {showForm ? 'Cancel' : '+ New Board'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Board</h2>
            {error && <p className="bg-red-100 text-red-600 px-3 py-2 rounded mb-3 text-sm">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Board title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.members.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{u.name} <span className="text-gray-400">({u.email})</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
                Create Board
              </button>
            </form>
          </div>
        )}

        {loading ? <Spinner /> : (
          <div className="space-y-4">
            {boards.map(board => (
              <div key={board.id} className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{board.title}</h3>
                  <p className="text-sm text-gray-500">{board.description || 'No description'}</p>
                  <p className="text-xs text-gray-400 mt-1">{board.members?.length || 0} members</p>
                </div>
                <button
                  onClick={() => handleDelete(board.id)}
                  className="text-red-500 hover:text-red-700 text-sm border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
            {boards.length === 0 && <p className="text-center text-gray-400 py-10">No boards yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}