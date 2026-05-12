import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure than implicit flow
  },
})

// Storage bucket names
export const BUCKETS = {
  QUESTION_PAPERS: 'question-papers',
  NOTES: 'notes',
}

// Helper: get a signed URL for secure file access (expires in 1 hour)
export async function getSignedUrl(bucket, path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600)

  if (error) throw error
  return data.signedUrl
}

// Helper: upload a file to storage
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false })

  if (error) throw error
  return data
}

// Helper: delete a file from storage
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
