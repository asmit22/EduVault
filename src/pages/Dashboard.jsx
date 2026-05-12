import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSemesters, useQuestionPapers, useNotes } from '../hooks/useData'
import { PageHeader, Card, Skeleton } from '../components/ui'
import { FileText, BookOpen, GraduationCap, ArrowRight, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { semesters, loading: semLoad } = useSemesters()
  const { papers, loading: papersLoad } = useQuestionPapers()
  const { notes, loading: notesLoad } = useNotes()

  const greeting = getGreeting()
  const name = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]

  const stats = [
    { label: 'Total Semesters', value: semesters.length, icon: GraduationCap, color: '#6366f1' },
    { label: 'Question Papers', value: papers.length, icon: FileText, color: '#8b5cf6' },
    { label: 'Notes Available', value: notes.length, icon: BookOpen, color: '#a855f7' },
  ]

  return (
    <div className="page">
      <PageHeader
        title={`${greeting}, ${name} 👋`}
        subtitle="Here's what's available in your resource hub today."
      />

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20`, color }}>
              <Icon size={20} />
            </div>
            <div>
              <p className="stat-value">
                {papersLoad || notesLoad || semLoad ? '—' : value}
              </p>
              <p className="stat-label">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="section-heading">
        <TrendingUp size={16} />
        <h2>Browse by Semester</h2>
      </div>

      <div className="semester-grid">
        {semLoad
          ? Array(8).fill(0).map((_, i) => <Skeleton key={i} height="100px" />)
          : semesters.map(sem => (
            <Link key={sem.id} to={`/question-papers?semester=${sem.id}`} className="semester-card">
              <div className="sem-number">Sem {sem.number}</div>
              <div className="sem-label">{sem.label}</div>
              <ArrowRight size={14} className="sem-arrow" />
            </Link>
          ))
        }
      </div>

      {/* Quick links */}
      <div className="quick-links">
        <Link to="/question-papers" className="quick-link-card">
          <div className="quick-link-icon qp"><FileText size={24} /></div>
          <div>
            <h3>Question Papers</h3>
            <p>Mid-term & End-semester papers</p>
          </div>
          <ArrowRight size={16} className="ml-auto" />
        </Link>
        <Link to="/notes" className="quick-link-card">
          <div className="quick-link-icon notes"><BookOpen size={24} /></div>
          <div>
            <h3>Notes</h3>
            <p>Subject-wise study material</p>
          </div>
          <ArrowRight size={16} className="ml-auto" />
        </Link>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
