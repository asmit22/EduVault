import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PageHeader, Alert, Badge, Skeleton } from '../components/ui'
import { Users, Shield, ShieldOff, Search } from 'lucide-react'

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => { fetchProfiles() }, [])

  async function fetchProfiles() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProfiles(data)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function toggleRole(profile) {
    const newRole = profile.role === 'admin' ? 'student' : 'admin'
    if (!confirm(`Change ${profile.full_name}'s role to ${newRole}?`)) return

    setUpdatingId(profile.id)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profile.id)
      if (error) throw error
      setProfiles(ps => ps.map(p => p.id === profile.id ? { ...p, role: newRole } : p))
      setMessage({ type: 'success', text: `Role updated to ${newRole}.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.roll_number?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="page">
      <PageHeader
        title="User Management"
        subtitle={`${profiles.length} registered users`}
      />

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Search */}
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search by name, email, or roll number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users table */}
      {loading ? (
        <div className="admin-card">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} height="56px" className="mb-2" />)}
        </div>
      ) : (
        <div className="admin-card">
          <div className="users-table">
            <div className="users-table-header">
              <span>Student</span>
              <span>Roll No.</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Action</span>
            </div>
            {filtered.length === 0 ? (
              <p className="muted" style={{ padding: '1.5rem' }}>No users found.</p>
            ) : filtered.map(profile => (
              <div key={profile.id} className="users-table-row">
                <div className="user-cell">
                  <div className="user-avatar-sm">
                    {profile.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="user-cell-name">{profile.full_name || '—'}</p>
                    <p className="user-cell-email">{profile.email}</p>
                  </div>
                </div>
                <span className="roll-cell">{profile.roll_number || '—'}</span>
                <span>
                  <Badge variant={profile.role === 'admin' ? 'purple' : 'default'}>
                    {profile.role}
                  </Badge>
                </span>
                <span className="date-cell">
                  {new Date(profile.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
                <button
                  className={`role-toggle-btn ${profile.role === 'admin' ? 'demote' : 'promote'}`}
                  onClick={() => toggleRole(profile)}
                  disabled={updatingId === profile.id}
                >
                  {profile.role === 'admin' ? (
                    <><ShieldOff size={13} /> Remove Admin</>
                  ) : (
                    <><Shield size={13} /> Make Admin</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
