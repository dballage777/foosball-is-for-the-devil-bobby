"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

export function AuthForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <div className="rounded-xl border border-accent/40 bg-brand-soft/40 p-5 text-sm">
        <p className="font-medium text-brand">Authentication not configured</p>
        <p className="mt-1 text-muted">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>{" "}
          to enable accounts. See <code>docs/deployment.md</code>.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    const supabase = createClient();
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || undefined } },
        });
        if (error) throw error;
        setStatus(
          "Account created. If email confirmation is enabled, check your inbox, then sign in.",
        );
        setMode("sign-in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <div className="flex gap-2 text-sm">
        {(["sign-in", "sign-up"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 font-medium ${
              mode === m
                ? "bg-brand text-white"
                : "border border-line hover:bg-brand-soft"
            }`}
          >
            {m === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {mode === "sign-up" && (
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2"
            autoComplete="name"
          />
        </label>
      )}

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

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Password</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status && <p className="text-sm text-green-700">{status}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.refresh();
      }}
      className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-brand-soft"
    >
      Sign out
    </button>
  );
}
