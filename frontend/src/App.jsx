import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BoardView from './pages/BoardView'
import AdminUsers from './pages/admin/AdminUsers'
import AdminBoards from './pages/admin/AdminBoards'
import ProtectedRoute from './components/common/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/boards/:boardId" element={
        <ProtectedRoute><BoardView /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>
      } />
      <Route path="/admin/boards" element={
        <ProtectedRoute adminOnly><AdminBoards /></ProtectedRoute>
      } />
    </Routes>
  )
}