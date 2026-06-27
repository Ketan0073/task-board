import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Spinner from '../../components/common/Spinner'
import api from '../../api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = () => {
    api.get('/api/users').then(res => {
      setUsers(res.data.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    await api.delete(`/api/users/${id}`)
    fetchUsers()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h1>
        {loading ? <Spinner /> : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Name</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Email</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Role</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}