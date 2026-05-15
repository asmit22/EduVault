import { Link } from 'react-router-dom'
import { BookOpen, FileText, Shield, Zap, GraduationCap, ArrowRight } from 'lucide-react'

export default function Landing() {
  const features = [
    {
      icon: FileText,
      title: 'Past Question Papers',
      desc: 'Mid-term 1 & 2, End-semester papers organized by semester and subject.',
    },
    {
      icon: BookOpen,
      title: 'Subject-wise Notes',
      desc: 'Comprehensive notes for every subject across all semesters.',
    },
    {
      icon: Shield,
      title: 'Secure Access',
      desc: 'College-verified accounts only. Your resources, protected.',
    },
    {
      icon: Zap,
      title: 'Instant Download',
      desc: 'Signed, expiring download links. No ads, no friction.',
    },
  ]

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <GraduationCap size={22} />
          <span>EduVault</span>
        </div>
        <div className="landing-header-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Access</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-tag">For students, by students</div>
          <h1 className="hero-title">
            Every paper.<br />
            Every note.<br />
            <span className="hero-accent">One place.</span>
          </h1>
          <p className="hero-subtitle">
            Access past year question papers and subject-wise notes
            for every semester — organized, searchable, and always available.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-stack">
            {['End Semester 2024', 'Mid Term 1 2024', 'Mid Term 2 2023'].map((label, i) => (
              <div key={i} className="hero-paper-card" style={{ '--i': i }}>
                <FileText size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Everything you need to study smarter</h2>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon"><Icon size={20} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to stop searching and start studying?</h2>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started — it's free
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} EduVault. For educational use only.</p>
      </footer>
    </div>
  )
}
