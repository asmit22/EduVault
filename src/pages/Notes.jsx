import { useState } from 'react'
import { useSemesters, useSubjects, useNotes } from '../hooks/useData'
import { getSignedUrl, BUCKETS } from '../lib/supabase'
import { PageHeader, Select, EmptyState, Skeleton, Alert } from '../components/ui'
import { BookOpen, Download, Filter, Clock } from 'lucide-react'

export default function Notes() {
  const [filters, setFilters] = useState({ semesterId: '', subjectId: '' })
  const [downloadError, setDownloadError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const { semesters } = useSemesters()
  const { subjects } = useSubjects(filters.semesterId)
  const { notes, loading } = useNotes(filters)

  function setFilter(key, value) {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'semesterId' ? { subjectId: '' } : {}),
    }))
  }

  async function handleDownload(note) {
    setDownloadingId(note.id)
    setDownloadError('')
    try {
      const url = await getSignedUrl(BUCKETS.NOTES, note.file_path)
      const a = document.createElement('a')
      a.href = url
      a.download = note.title
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.click()
    } catch {
      setDownloadError('Failed to generate download link. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Group notes by subject
  const grouped = notes.reduce((acc, note) => {
    const key = note.subject_id
    if (!acc[key]) acc[key] = { subject: note.subjects, items: [] }
    acc[key].items.push(note)
    return acc
  }, {})

  return (
    <div className="page">
      <PageHeader
        title="Notes"
        subtitle="Subject-wise study material across all semesters"
      />

      {downloadError && (
        <Alert type="error" message={downloadError} onClose={() => setDownloadError('')} />
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-icon"><Filter size={15} /></div>
        <Select value={filters.semesterId} onChange={e => setFilter('semesterId', e.target.value)}>
          <option value="">All Semesters</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>Semester {s.number} — {s.label}</option>
          ))}
        </Select>

        <Select
          value={filters.subjectId}
          onChange={e => setFilter('subjectId', e.target.value)}
          disabled={!filters.semesterId}
        >
          <option value="">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
          ))}
        </Select>
      </div>

      {!loading && (
        <p className="results-count">{notes.length} note{notes.length !== 1 ? 's' : ''} found</p>
      )}

      {loading ? (
        <div className="notes-grid">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} height="140px" />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No notes found"
          description="Try adjusting your filters or check back later."
        />
      ) : (
        <div className="notes-sections">
          {Object.values(grouped).map(({ subject, items }) => (
            <div key={subject?.id} className="notes-section">
              <div className="notes-section-header">
                <h2>{subject?.name}</h2>
                <span className="subject-code">{subject?.code}</span>
              </div>
              <div className="notes-grid">
                {items.map(note => (
                  <div key={note.id} className="note-card">
                    <div className="note-icon"><BookOpen size={20} /></div>
                    <div className="note-info">
                      <h3 className="note-title">{note.title}</h3>
                      {note.description && (
                        <p className="note-desc">{note.description}</p>
                      )}
                      <div className="note-meta">
                        <Clock size={11} />
                        <span>{new Date(note.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}</span>
                        {note.file_size_kb && (
                          <span>· {formatSize(note.file_size_kb)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`download-btn ${downloadingId === note.id ? 'loading' : ''}`}
                      onClick={() => handleDownload(note)}
                      disabled={downloadingId === note.id}
                    >
                      <Download size={14} />
                      <span>{downloadingId === note.id ? '...' : 'Download'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatSize(kb) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}
