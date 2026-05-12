import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  BookOpen, FileText, LogOut, Menu, X,
  LayoutDashboard, Upload, Users, ChevronDown, GraduationCap
} from 'lucide-react'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/question-papers', label: 'Question Papers', icon: FileText },
    { to: '/notes', label: 'Notes', icon: BookOpen },
    ...(isAdmin ? [
      { to: '/admin', label: 'Admin Panel', icon: Upload },
      { to: '/admin/users', label: 'Users', icon: Users },
    ] : []),
  ]

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <GraduationCap size={22} />
          <span>EduVault</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${isActive(to) ? 'active' : ''}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* User menu */}
        <div className="navbar-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
          <div className="user-avatar">
            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <span className="user-name">{profile?.full_name || user?.email?.split('@')[0]}</span>
          {isAdmin && <span className="admin-badge">Admin</span>}
          <ChevronDown size={14} className={`chevron ${userMenuOpen ? 'open' : ''}`} />

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-info">
                <p className="dropdown-name">{profile?.full_name}</p>
                <p className="dropdown-email">{user?.email}</p>
                {profile?.roll_number && (
                  <p className="dropdown-roll">Roll: {profile.roll_number}</p>
                )}
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleSignOut}>
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-link ${isActive(to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button className="mobile-link danger" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}
