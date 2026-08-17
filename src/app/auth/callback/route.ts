import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth/email/recovery callback. Supabase redirects here with a `code` (PKCE)
 * that we exchange for a session, then forward to `next` (default /account).
 * Used by email confirmation and password-recovery links.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code && isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  // Fallback: send them to the account page with a soft error flag.
  return NextResponse.redirect(`${origin}/account?error=auth_callback`);
}
