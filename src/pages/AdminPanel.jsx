import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, uploadFile, deleteFile, BUCKETS } from '../lib/supabase'
import { useSemesters, useSubjects, useQuestionPapers, useNotes } from '../hooks/useData'
import { PageHeader, Button, Input, Select, Alert, Badge } from '../components/ui'
import {
  Upload, FileText, BookOpen, Trash2, Plus, ChevronDown, ChevronRight, Users
} from 'lucide-react'

const EXAM_TYPES = [
  { value: 'mid1', label: 'Mid Term 1' },
  { value: 'mid2', label: 'Mid Term 2' },
  { value: 'endsem', label: 'End Semester' },
]

const EXAM_COLORS = { mid1: 'blue', mid2: 'purple', endsem: 'green' }
const EXAM_LABELS = { mid1: 'Mid 1', mid2: 'Mid 2', endsem: 'End Sem' }

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('papers') // papers | notes | subjects
  const [message, setMessage] = useState(null) // { type, text }

  function showMsg(type, text) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="page">
      <PageHeader
        title="Admin Panel"
        subtitle="Upload resources and manage content"
        action={
          <Link to="/admin/users" className="btn btn-outline btn-sm">
            <Users size={14} /> Manage Users
          </Link>
        }
      />

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { id: 'papers', label: 'Question Papers', icon: FileText },
          { id: 'notes', label: 'Notes', icon: BookOpen },
          { id: 'subjects', label: 'Subjects & Semesters', icon: Plus },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`admin-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'papers' && <UploadPapers onMsg={showMsg} />}
      {activeTab === 'notes' && <UploadNotes onMsg={showMsg} />}
      {activeTab === 'subjects' && <ManageSubjects onMsg={showMsg} />}
    </div>
  )
}

// ─── Upload Question Papers ────────────────────────────────────
function UploadPapers({ onMsg }) {
  const { semesters } = useSemesters()
  const [semesterId, setSemesterId] = useState('')
  const { subjects, loading: subLoad } = useSubjects(semesterId)
  const { papers, loading, refetch } = useQuestionPapers({ semesterId })

  const [form, setForm] = useState({ title: '', subjectId: '', examType: 'mid1', year: new Date().getFullYear().toString() })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !form.title || !form.subjectId || !semesterId) {
      onMsg('error', 'Please fill all fields and select a file.')
      return
    }
    if (file.type !== 'application/pdf') {
      onMsg('error', 'Only PDF files are allowed.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      onMsg('error', 'File size must be under 10 MB.')
      return
    }

    setUploading(true)
    try {
      const path = `sem${semesterId}/${form.subjectId}/${form.examType}_${form.year}_${Date.now()}.pdf`
      await uploadFile(BUCKETS.QUESTION_PAPERS, path, file)

      const { error } = await supabase.from('question_papers').insert({
        title: form.title,
        subject_id: form.subjectId,
        semester_id: semesterId,
        exam_type: form.examType,
        year: parseInt(form.year),
        file_path: path,
        file_size_kb: Math.round(file.size / 1024),
      })
      if (error) throw error

      onMsg('success', 'Question paper uploaded successfully!')
      setForm({ title: '', subjectId: '', examType: 'mid1', year: new Date().getFullYear().toString() })
      setFile(null)
      refetch()
    } catch (err) {
      onMsg('error', err.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(paper) {
    if (!confirm(`Delete "${paper.title}"? This cannot be undone.`)) return
    setDeletingId(paper.id)
    try {
      await deleteFile(BUCKETS.QUESTION_PAPERS, paper.file_path)
      const { error } = await supabase.from('question_papers').delete().eq('id', paper.id)
      if (error) throw error
      onMsg('success', 'Paper deleted.')
      refetch()
    } catch (err) {
      onMsg('error', err.message || 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-section">
      {/* Upload form */}
      <div className="admin-card">
        <h2 className="admin-card-title"><Upload size={16} /> Upload Question Paper</h2>
        <form onSubmit={handleUpload} className="admin-form">
          <div className="form-row">
            <Select label="Semester" value={semesterId} onChange={e => setSemesterId(e.target.value)}>
              <option value="">Select semester</option>
              {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
            </Select>
            <Select
              label="Subject"
              value={form.subjectId}
              onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
              disabled={!semesterId || subLoad}
            >
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>

          <Input
            label="Paper Title"
            placeholder="e.g., Data Structures End Semester 2024"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />

          <div className="form-row">
            <Select label="Exam Type" value={form.examType} onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}>
              {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Input
              label="Year"
              type="number"
              min="2000"
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
            />
          </div>

          <div className="file-upload-area">
            <label className="file-label">
              <input
                type="file"
                accept=".pdf"
                className="file-input"
                onChange={e => setFile(e.target.files[0] || null)}
              />
              <Upload size={18} />
              <span>{file ? file.name : 'Click to select PDF (max 10 MB)'}</span>
            </label>
          </div>

          <Button type="submit" loading={uploading} disabled={!file}>
            <Upload size={14} /> Upload Paper
          </Button>
        </form>
      </div>

      {/* Existing papers */}
      <div className="admin-card">
        <h2 className="admin-card-title"><FileText size={16} /> Uploaded Papers</h2>
        <div className="filter-bar" style={{ marginBottom: '1rem' }}>
          <Select value={semesterId} onChange={e => setSemesterId(e.target.value)}>
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
          </Select>
        </div>
        {loading ? <p className="muted">Loading...</p> : papers.length === 0 ? (
          <p className="muted">No papers uploaded yet.</p>
        ) : (
          <div className="admin-list">
            {papers.map(p => (
              <div key={p.id} className="admin-list-item">
                <div className="admin-item-info">
                  <span className="admin-item-title">{p.title}</span>
                  <div className="admin-item-meta">
                    <span>{p.subjects?.name}</span>
                    <span>·</span>
                    <Badge variant={EXAM_COLORS[p.exam_type]}>{EXAM_LABELS[p.exam_type]}</Badge>
                    <span>·</span>
                    <span>{p.year}</span>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Upload Notes ──────────────────────────────────────────────
function UploadNotes({ onMsg }) {
  const { semesters } = useSemesters()
  const [semesterId, setSemesterId] = useState('')
  const { subjects } = useSubjects(semesterId)
  const { notes, loading, refetch } = useNotes({ semesterId })

  const [form, setForm] = useState({ title: '', description: '', subjectId: '' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !form.title || !form.subjectId || !semesterId) {
      onMsg('error', 'Please fill all fields and select a file.')
      return
    }
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      onMsg('error', 'Only PDF and DOCX files are allowed.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      onMsg('error', 'File size must be under 20 MB.')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `sem${semesterId}/${form.subjectId}/${Date.now()}.${ext}`
      await uploadFile(BUCKETS.NOTES, path, file)

      const { error } = await supabase.from('notes').insert({
        title: form.title,
        description: form.description,
        subject_id: form.subjectId,
        semester_id: semesterId,
        file_path: path,
        file_size_kb: Math.round(file.size / 1024),
      })
      if (error) throw error

      onMsg('success', 'Notes uploaded successfully!')
      setForm({ title: '', description: '', subjectId: '' })
      setFile(null)
      refetch()
    } catch (err) {
      onMsg('error', err.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(note) {
    if (!confirm(`Delete "${note.title}"?`)) return
    setDeletingId(note.id)
    try {
      await deleteFile(BUCKETS.NOTES, note.file_path)
      const { error } = await supabase.from('notes').delete().eq('id', note.id)
      if (error) throw error
      onMsg('success', 'Note deleted.')
      refetch()
    } catch (err) {
      onMsg('error', err.message || 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-card">
        <h2 className="admin-card-title"><Upload size={16} /> Upload Notes</h2>
        <form onSubmit={handleUpload} className="admin-form">
          <div className="form-row">
            <Select label="Semester" value={semesterId} onChange={e => setSemesterId(e.target.value)}>
              <option value="">Select semester</option>
              {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
            </Select>
            <Select
              label="Subject"
              value={form.subjectId}
              onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
              disabled={!semesterId}
            >
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>

          <Input
            label="Notes Title"
            placeholder="e.g., Unit 3 - Trees and Graphs"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Description (optional)"
            placeholder="Brief description of the content"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />

          <div className="file-upload-area">
            <label className="file-label">
              <input
                type="file"
                accept=".pdf,.docx"
                className="file-input"
                onChange={e => setFile(e.target.files[0] || null)}
              />
              <Upload size={18} />
              <span>{file ? file.name : 'Click to select PDF or DOCX (max 20 MB)'}</span>
            </label>
          </div>

          <Button type="submit" loading={uploading} disabled={!file}>
            <Upload size={14} /> Upload Notes
          </Button>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title"><BookOpen size={16} /> Uploaded Notes</h2>
        <div className="filter-bar" style={{ marginBottom: '1rem' }}>
          <Select value={semesterId} onChange={e => setSemesterId(e.target.value)}>
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
          </Select>
        </div>
        {loading ? <p className="muted">Loading...</p> : notes.length === 0 ? (
          <p className="muted">No notes uploaded yet.</p>
        ) : (
          <div className="admin-list">
            {notes.map(n => (
              <div key={n.id} className="admin-list-item">
                <div className="admin-item-info">
                  <span className="admin-item-title">{n.title}</span>
                  <div className="admin-item-meta">
                    <span>{n.subjects?.name}</span>
                    <span>· Sem {n.semesters?.number}</span>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(n)} disabled={deletingId === n.id}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Manage Subjects & Semesters ──────────────────────────────
function ManageSubjects({ onMsg }) {
  const { semesters, loading: semLoad } = useSemesters()
  const [selectedSem, setSelectedSem] = useState('')
  const { subjects, loading: subLoad, refetch } = useSubjects(selectedSem)

  const [semForm, setSemForm] = useState({ number: '', label: '' })
  const [subForm, setSubForm] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)

  async function addSemester(e) {
    e.preventDefault()
    if (!semForm.number || !semForm.label) { onMsg('error', 'Fill both fields.'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('semesters').insert({
        number: parseInt(semForm.number), label: semForm.label
      })
      if (error) throw error
      onMsg('success', 'Semester added!')
      setSemForm({ number: '', label: '' })
    } catch (err) {
      onMsg('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  async function addSubject(e) {
    e.preventDefault()
    if (!selectedSem || !subForm.name || !subForm.code) { onMsg('error', 'Fill all fields.'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('subjects').insert({
        name: subForm.name, code: subForm.code.toUpperCase(), semester_id: selectedSem
      })
      if (error) throw error
      onMsg('success', 'Subject added!')
      setSubForm({ name: '', code: '' })
      refetch()
    } catch (err) {
      onMsg('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-card">
        <h2 className="admin-card-title"><Plus size={16} /> Add Semester</h2>
        <form onSubmit={addSemester} className="admin-form">
          <div className="form-row">
            <Input
              label="Semester Number"
              type="number" min="1" max="8"
              placeholder="e.g., 1"
              value={semForm.number}
              onChange={e => setSemForm(f => ({ ...f, number: e.target.value }))}
            />
            <Input
              label="Label"
              placeholder="e.g., First Year First Half"
              value={semForm.label}
              onChange={e => setSemForm(f => ({ ...f, label: e.target.value }))}
            />
          </div>
          <Button type="submit" loading={saving} variant="secondary">
            <Plus size={14} /> Add Semester
          </Button>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title"><Plus size={16} /> Add Subject</h2>
        <form onSubmit={addSubject} className="admin-form">
          <Select label="Semester" value={selectedSem} onChange={e => setSelectedSem(e.target.value)}>
            <option value="">Select semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.number} — {s.label}</option>)}
          </Select>
          <div className="form-row">
            <Input
              label="Subject Name"
              placeholder="e.g., Data Structures and Algorithms"
              value={subForm.name}
              onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Subject Code"
              placeholder="e.g., CS301"
              value={subForm.code}
              onChange={e => setSubForm(f => ({ ...f, code: e.target.value }))}
            />
          </div>
          <Button type="submit" loading={saving} variant="secondary">
            <Plus size={14} /> Add Subject
          </Button>
        </form>

        {selectedSem && (
          <div className="subjects-list">
            <h3>Subjects in Semester {semesters.find(s => s.id === selectedSem)?.number}</h3>
            {subLoad ? <p className="muted">Loading...</p> : subjects.length === 0 ? (
              <p className="muted">No subjects yet. Add one above.</p>
            ) : (
              subjects.map(s => (
                <div key={s.id} className="admin-list-item">
                  <span className="admin-item-title">{s.name}</span>
                  <Badge variant="default">{s.code}</Badge>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
