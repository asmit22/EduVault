import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Alert } from '../components/ui'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '', rollNumber: '', email: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.rollNumber.trim()) e.rollNumber = 'Roll number is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password))
      e.password = 'Must include at least one uppercase letter and one number'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setServerError('')
    try {
      await signUp(form.email, form.password, form.fullName, form.rollNumber)
      setSuccess(true)
    } catch (err) {
      setServerError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-glow" />
        <div className="auth-card text-center">
          <div className="success-icon">✓</div>
          <h2>Check your email</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            We've sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem', display: 'flex' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    )
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
          <h1>Create account</h1>
          <p>Join your college's resource hub</p>
        </div>

        {serverError && (
          <Alert type="error" message={serverError} onClose={() => setServerError('')} />
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange('fullName')}
              error={errors.fullName}
              autoComplete="name"
            />
            <Input
              label="Roll Number"
              type="text"
              placeholder="21CS001"
              value={form.rollNumber}
              onChange={handleChange('rollNumber')}
              error={errors.rollNumber}
            />
          </div>

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
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="btn-full">
            Create Account
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
