import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Resolves the authenticated Supabase user for an API request. This uses the
 * anonymous key and the request cookies, so it never grants service-role
 * privileges based on client-provided data.
 */
export async function getAuthenticatedUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase authentication environment variables are required.");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // Route handlers do not refresh a session here; middleware owns writes.
      setAll() {},
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user;
}
