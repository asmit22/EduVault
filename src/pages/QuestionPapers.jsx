import { useState } from 'react'
import { useSemesters, useSubjects, useQuestionPapers } from '../hooks/useData'
import { getSignedUrl, BUCKETS } from '../lib/supabase'
import { PageHeader, Select, Badge, EmptyState, Skeleton, Alert } from '../components/ui'
import { FileText, Download, Filter, Calendar } from 'lucide-react'

const EXAM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'mid1', label: 'Mid Term 1' },
  { value: 'mid2', label: 'Mid Term 2' },
  { value: 'endsem', label: 'End Semester' },
]

const EXAM_LABELS = {
  mid1: 'Mid Term 1',
  mid2: 'Mid Term 2',
  endsem: 'End Semester',
}

const EXAM_COLORS = {
  mid1: 'blue',
  mid2: 'purple',
  endsem: 'green',
}

export default function QuestionPapers() {
  const [filters, setFilters] = useState({ semesterId: '', subjectId: '', examType: '' })
  const [downloadError, setDownloadError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const { semesters } = useSemesters()
  const { subjects } = useSubjects(filters.semesterId)
  const { papers, loading } = useQuestionPapers(filters)

  function setFilter(key, value) {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'semesterId' ? { subjectId: '' } : {}),
    }))
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
    } catch (err) {
      setDownloadError('Failed to generate download link. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

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
        <Select
          value={filters.semesterId}
          onChange={e => setFilter('semesterId', e.target.value)}
        >
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

        <Select
          value={filters.examType}
          onChange={e => setFilter('examType', e.target.value)}
        >
          {EXAM_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="results-count">{papers.length} paper{papers.length !== 1 ? 's' : ''} found</p>
      )}

      {/* Papers list */}
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
      ) : (
        <div className="papers-list">
          {papers.map(paper => (
            <div key={paper.id} className="paper-card">
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
                onClick={() => handleDownload(paper)}
                disabled={downloadingId === paper.id}
              >
                <Download size={15} />
                <span>{downloadingId === paper.id ? 'Getting link...' : 'Download'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
