/**
 * Runtime configuration guards. Pages use these to render honest "not
 * configured" states instead of crashing or faking data when a dependency
 * (like Supabase) has not been set up yet.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Normalize NEXT_PUBLIC_SITE_URL into a valid absolute URL. A value pasted
 * without a protocol (e.g. "my-app.vercel.app") would otherwise crash
 * `new URL(...)` in the root layout and take down every page.
 */
function normalizeSiteUrl(raw?: string): string {
  const fallback = "http://localhost:3000";
  const trimmed = raw?.trim();
  if (!trimmed) return fallback;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
}

export const SITE = {
  name: "Berean",
  tagline: "Read Scripture. Study together. Examine the evidence.",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
};
