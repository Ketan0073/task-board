import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../store/authSlice'

export default function Navbar() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center shadow">
      <Link to="/dashboard" className="text-xl font-bold tracking-wide">TaskBoard</Link>
      <div className="flex items-center gap-4">
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/users" className="text-sm hover:underline">Users</Link>
            <Link to="/admin/boards" className="text-sm hover:underline">Boards</Link>
          </>
        )}
        <span className="text-sm text-blue-200">{user?.name}</span>
        <button onClick={handleLogout} className="bg-white text-blue-700 text-sm px-3 py-1 rounded hover:bg-blue-100">
          Logout
        </button>
      </div>
    </nav>
  )
}