import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/auth/RouteGuards'
import AppLayout from './components/layout/AppLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import QuestionPapers from './pages/QuestionPapers'
import Notes from './pages/Notes'
import AdminPanel from './pages/AdminPanel'
import AdminUsers from './pages/AdminUsers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected - students */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/question-papers" element={
            <ProtectedRoute>
              <AppLayout><QuestionPapers /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/notes" element={
            <ProtectedRoute>
              <AppLayout><Notes /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <AdminRoute>
              <AppLayout><AdminPanel /></AppLayout>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AppLayout><AdminUsers /></AppLayout>
            </AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
