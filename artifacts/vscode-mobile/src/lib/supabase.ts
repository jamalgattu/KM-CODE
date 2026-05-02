import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : (null as unknown as ReturnType<typeof createClient>)

const authRedirectUrl = () =>
  window.location.origin + window.location.pathname.replace(/\/$/, '')

export const signInWithGoogle = () => {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: authRedirectUrl() },
  })
}

export const signInWithGitHub = () => {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: authRedirectUrl() },
  })
}

export const signOut = () => {
  if (!isSupabaseConfigured) return Promise.resolve()
  return supabase.auth.signOut()
}

export const getUser = async () => {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase.auth.getUser()
  return data.user
}

export const onAuthChange = (callback: (user: unknown) => void) => {
  if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe: () => {} } } }
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export const createProject = async (name: string, description = '') => {
  const user = await getUser()
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description, user_id: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateProject = async (id: string, updates: {
  name?: string
  description?: string
  is_public?: boolean
}) => {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteProject = async (id: string) => {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export const getFiles = async (projectId: string) => {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', projectId)
    .order('path')
  if (error) throw error
  return data
}

export const saveFile = async (
  projectId: string,
  name: string,
  path: string,
  content: string,
  language: string
) => {
  const { data, error } = await supabase
    .from('files')
    .upsert(
      { project_id: projectId, name, path, content, language, updated_at: new Date().toISOString() },
      { onConflict: 'project_id,path' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteFile = async (id: string) => {
  const { error } = await supabase.from('files').delete().eq('id', id)
  if (error) throw error
}

export const getPublicProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, files(*)')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}
