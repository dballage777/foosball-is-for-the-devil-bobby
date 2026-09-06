import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server Supabase client bound to the request cookies. Runs as the signed-in
 * user (anon key + user session) and is therefore fully subject to Row Level
 * Security — the primary enforcement point for per-user authorization.
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as never),
            );
          } catch {
            // `set` throws in Server Components; middleware refreshes the session.
          }
        },
      },
    },
  );
}

/**
 * Convenience: returns the authenticated user or null. Uses getUser() (which
 * validates the JWT with the auth server) rather than trusting the session.
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // Supabase unreachable/paused — treat as signed-out rather than crashing.
    return null;
  }
}
