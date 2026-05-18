import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSemesters, useSubjects, useQuestionPapers } from '../hooks/useData'
import { getSignedUrl, BUCKETS } from '../lib/supabase'
import { PageHeader, Select, Badge, EmptyState, Skeleton, Alert } from '../components/ui'
import { FileText, Download, Filter, Calendar, ChevronDown, ChevronRight } from 'lucide-react'

const EXAM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'mid1', label: 'Mid Term 1' },
  { value: 'mid2', label: 'Mid Term 2' },
  { value: 'endsem', label: 'End Semester' },
]

const EXAM_LABELS = { mid1: 'Mid Term 1', mid2: 'Mid Term 2', endsem: 'End Semester' }
const EXAM_COLORS = { mid1: 'blue', mid2: 'purple', endsem: 'green' }

export default function QuestionPapers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    semesterId: searchParams.get('semester') || '',
    subjectId: '',
    examType: '',
  })
  const [downloadError, setDownloadError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const { semesters } = useSemesters()
  const { subjects } = useSubjects(filters.semesterId)
  const { papers, loading } = useQuestionPapers(filters)

  // sync semester from URL param (e.g. when clicking from dashboard)
  useEffect(() => {
    const semFromUrl = searchParams.get('semester')
    if (semFromUrl) {
      setFilters(f => ({ ...f, semesterId: semFromUrl, subjectId: '' }))
    }
  }, [searchParams])

  function setFilter(key, value) {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'semesterId' ? { subjectId: '' } : {}),
    }))
    if (key === 'semesterId') {
      if (value) setSearchParams({ semester: value })
      else setSearchParams({})
    }
  }

  async function handleDownload(paper) {
    setDownloadingId(paper.id)
    setDownloadError('')
    try {
      const url = await getSignedUrl(BUCKETS.QUESTION_PAPERS, paper.file_path)
      const a = document.createElement('a')
      a.href = url
      a.download = paper.title
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.click()
    } catch {
      setDownloadError('Failed to generate download link. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Group by semester when no semester filter is applied
  const grouped = !filters.semesterId
    ? papers.reduce((acc, paper) => {
        const key = paper.semester_id
        if (!acc[key]) acc[key] = { sem: paper.semesters, items: [] }
        acc[key].items.push(paper)
        return acc
      }, {})
    : null

  return (
    <div className="page">
      <PageHeader
        title="Question Papers"
        subtitle="Past year mid-term and end-semester question papers"
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

        <Select value={filters.examType} onChange={e => setFilter('examType', e.target.value)}>
          {EXAM_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </div>

      {!loading && (
        <p className="results-count">{papers.length} paper{papers.length !== 1 ? 's' : ''} found</p>
      )}

      {/* Grouped view (no semester selected) */}
      {loading ? (
        <div className="papers-list">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} height="80px" className="mb-2" />)}
        </div>
      ) : papers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No papers found"
          description="Try adjusting your filters or check back later."
        />
      ) : grouped ? (
        // Show grouped by semester when no filter applied
        <div className="notes-sections">
          {semesters
            .filter(s => grouped[s.id])
            .map(s => (
              <SemesterGroup
                key={s.id}
                semester={s}
                papers={grouped[s.id].items}
                downloadingId={downloadingId}
                onDownload={handleDownload}
                onSelectSemester={() => setFilter('semesterId', s.id)}
              />
            ))
          }
        </div>
      ) : (
        // Flat list when semester is selected
        <div className="papers-list">
          {papers.map(paper => (
            <PaperRow
              key={paper.id}
              paper={paper}
              downloadingId={downloadingId}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SemesterGroup({ semester, papers, downloadingId, onDownload, onSelectSemester }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="notes-section">
      <div
        className="notes-section-header"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <h2>Semester {semester.number}</h2>
        <span className="subject-code">{semester.label}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{papers.length} paper{papers.length !== 1 ? 's' : ''}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>
      {open && (
        <div className="papers-list">
          {papers.map(paper => (
            <PaperRow
              key={paper.id}
              paper={paper}
              downloadingId={downloadingId}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PaperRow({ paper, downloadingId, onDownload }) {
  return (
    <div className="paper-card">
      <div className="paper-icon">
        <FileText size={20} />
      </div>
      <div className="paper-info">
        <div className="paper-title-row">
          <h3 className="paper-title">{paper.title}</h3>
          <Badge variant={EXAM_COLORS[paper.exam_type]}>
            {EXAM_LABELS[paper.exam_type]}
          </Badge>
        </div>
        <div className="paper-meta">
          <span>{paper.subjects?.name} ({paper.subjects?.code})</span>
          <span className="meta-dot">·</span>
          <span>Sem {paper.semesters?.number}</span>
          <span className="meta-dot">·</span>
          <Calendar size={12} />
          <span>{paper.year}</span>
        </div>
      </div>
      <button
        className={`download-btn ${downloadingId === paper.id ? 'loading' : ''}`}
        onClick={() => onDownload(paper)}
        disabled={downloadingId === paper.id}
      >
        <Download size={15} />
        <span>{downloadingId === paper.id ? 'Getting link...' : 'Download'}</span>
      </button>
    </div>
  )
}
