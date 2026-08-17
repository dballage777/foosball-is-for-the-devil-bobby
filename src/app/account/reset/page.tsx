"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

export default function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-brand">Reset password</h1>

      {!configured ? (
        <p className="mt-4 text-muted">
          Accounts aren&apos;t configured yet.
        </p>
      ) : sent ? (
        <div className="mt-6 rounded-xl border border-accent/40 bg-brand-soft/40 p-5 text-sm">
          <p className="font-medium text-brand">Check your email</p>
          <p className="mt-1 text-muted">
            If an account exists for {email}, a password-reset link is on its
            way. Open it to set a new password.
          </p>
          <Link href="/account" className="mt-3 inline-block text-accent hover:underline">
            Back to sign in →
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <p className="text-sm text-muted">
            Enter your email and we&apos;ll send a link to reset your password.
          </p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2"
              autoComplete="email"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <Link href="/account" className="block text-center text-sm text-accent hover:underline">
            Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
