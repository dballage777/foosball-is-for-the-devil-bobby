"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

/**
 * Landing page for the password-recovery link. The /auth/callback route has
 * already exchanged the recovery code for a session, so the user is briefly
 * authenticated here and can set a new password.
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push("/account"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-brand">Set a new password</h1>
      {!isSupabaseConfigured() ? (
        <p className="mt-4 text-muted">Accounts aren&apos;t configured yet.</p>
      ) : done ? (
        <p className="mt-6 rounded-md border border-accent/40 bg-brand-soft/40 p-4 text-sm text-brand">
          Password updated. Redirecting…
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">New password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2"
              autoComplete="new-password"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
