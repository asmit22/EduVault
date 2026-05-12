import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Alert } from '../components/ui'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function validate() {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setServerError('')
    try {
      await signIn(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">
          <GraduationCap size={28} />
          <span>EduVault</span>
        </div>

        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to access your resources</p>
        </div>

        {serverError && (
          <Alert type="error" message={serverError} onClose={() => setServerError('')} />
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="College Email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            autoComplete="email"
          />

          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(s => !s)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          <Button type="submit" loading={loading} className="btn-full">
            Sign In
          </Button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
