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

export const SITE = {
  name: "Berean",
  tagline: "Read Scripture. Study together. Examine the evidence.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
