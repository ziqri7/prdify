import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _adminClient: SupabaseClient | null = null

/**
 * Admin client — bypasses RLS, uses service_role key.
 * Only use in server-side code (API routes, server actions).
 * Lazy-init so build does not fail when env var is missing.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'supabaseUrl and SUPABASE_SERVICE_ROLE_KEY environment variables are required for admin client.'
      )
    }

    _adminClient = createClient(supabaseUrl, supabaseServiceKey)
  }
  return _adminClient
}

/** @deprecated Use getSupabaseAdmin() instead. Kept for backward compatibility. */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  },
})
