import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Requires authenticated user
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// Requires admin role
export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// Redirect logged-in users away from auth pages
export function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function FullPageSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0f'
    }}>
      <div className="spinner" />
    </div>
  )
}
