import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Hook: fetch all semesters
export function useSemesters() {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('semesters')
          .select('*')
          .order('number', { ascending: true })
        if (error) throw error
        setSemesters(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { semesters, loading, error }
}

// Hook: fetch subjects for a semester
export function useSubjects(semesterId) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!semesterId) { setLoading(false); return }

    async function fetch() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('semester_id', semesterId)
          .order('name', { ascending: true })
        if (error) throw error
        setSubjects(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [semesterId])

  return { subjects, loading, error }
}

// Hook: fetch question papers with optional filters
export function useQuestionPapers(filters = {}) {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('question_papers')
        .select(`
          *,
          subjects (name, code),
          semesters (number, label)
        `)
        .order('year', { ascending: false })

      if (filters.semesterId) query = query.eq('semester_id', filters.semesterId)
      if (filters.subjectId) query = query.eq('subject_id', filters.subjectId)
      if (filters.examType) query = query.eq('exam_type', filters.examType)

      const { data, error } = await query
      if (error) throw error
      setPapers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters.semesterId, filters.subjectId, filters.examType])

  useEffect(() => { fetch() }, [fetch])

  return { papers, loading, error, refetch: fetch }
}

// Hook: fetch notes with optional filters
export function useNotes(filters = {}) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('notes')
        .select(`
          *,
          subjects (name, code),
          semesters (number, label)
        `)
        .order('created_at', { ascending: false })

      if (filters.semesterId) query = query.eq('semester_id', filters.semesterId)
      if (filters.subjectId) query = query.eq('subject_id', filters.subjectId)

      const { data, error } = await query
      if (error) throw error
      setNotes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters.semesterId, filters.subjectId])

  useEffect(() => { fetch() }, [fetch])

  return { notes, loading, error, refetch: fetch }
}
