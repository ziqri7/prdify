import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Keep the PKCE code verifier in cookies. The OAuth callback is handled on the
// server, so localStorage (the default createClient storage) is not visible
// when exchangeCodeForSession runs there.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
  },
})
