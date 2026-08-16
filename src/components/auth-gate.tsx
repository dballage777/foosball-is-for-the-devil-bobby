import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";

/**
 * Presentational gate shown when a feature needs a signed-in user (or when
 * Supabase is not configured). Honest empty state — not fake data.
 */
export function AuthGate({ feature }: { feature: string }) {
  const configured = isSupabaseConfigured();
  return (
    <div className="mt-6 rounded-xl border border-accent/40 bg-brand-soft/40 p-6">
      <h2 className="font-serif text-lg font-semibold text-brand">
        {configured ? "Sign in required" : "Not configured yet"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {configured
          ? `Sign in to ${feature}. Your data is protected by database-level row security.`
          : `Configure Supabase (see docs/deployment.md) to enable ${feature}.`}
      </p>
      {configured && (
        <Link
          href="/account"
          className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Go to account →
        </Link>
      )}
    </div>
  );
}
