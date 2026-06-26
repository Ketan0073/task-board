import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/common/Navbar'
import Spinner from '../components/common/Spinner'
import api from '../api'

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/boards').then(res => {
      setBoards(res.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Boards</h1>
        </div>
        {loading ? <Spinner /> : (
          boards.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No boards yet.</p>
              {user?.role === 'admin' && <p className="text-sm mt-1">Go to Admin → Boards to create one.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map(board => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/boards/${board.id}`)}
                  className="bg-white rounded-xl shadow hover:shadow-md cursor-pointer p-6 border border-gray-100 hover:border-blue-300 transition"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">{board.title}</h2>
                  <p className="text-sm text-gray-500">{board.description || 'No description'}</p>
                  <p className="text-xs text-gray-400 mt-3">{board.members?.length || 0} members</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}