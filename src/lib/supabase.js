import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
}

export async function sbGet(table, params = '') {
  const r = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, { headers })
  if (!r.ok) throw new Error(`${r.status}`)
  return r.json()
}

export async function sbPost(table, data) {
  const r = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e.message || r.status)
  }
  return r.json()
}

export async function sbPatch(table, query, data) {
  const r = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!r.ok) throw new Error(`${r.status}`)
  return r.json()
}
