import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

// ─── Button ───────────────────────────────────────────────────
export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled, className = '', ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${loading ? 'loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────
export function Input({ label, error, helper, className = '', ...props }) {
  return (
    <div className={`form-field ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input className={`form-input ${error ? 'error' : ''}`} {...props} />
      {helper && !error && <p className="form-helper">{helper}</p>}
      {error && <p className="form-error"><AlertCircle size={12} />{error}</p>}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`form-field ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <select className={`form-select ${error ? 'error' : ''}`} {...props}>
        {children}
      </select>
      {error && <p className="form-error"><AlertCircle size={12} />{error}</p>}
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────
export function Alert({ type = 'info', message, onClose }) {
  const icons = { info: Info, success: CheckCircle, error: AlertCircle }
  const Icon = icons[type] || Info

  return (
    <div className={`alert alert-${type}`}>
      <Icon size={16} />
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

// ─── Skeleton ─────────────────────────────────────────────────
export function Skeleton({ width, height, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width || '100%', height: height || '1rem' }}
    />
  )
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <div className="empty-icon"><Icon size={36} /></div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  )
}
