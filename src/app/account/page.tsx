import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { AuthForm, SignOutButton } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in or create an account.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">Account</h1>

      {user ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="text-sm text-muted">Signed in as</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-4 max-w-md text-muted">
            Sign in to save highlights and notes, and to create or join Bible
            studies.
          </p>
          <AuthForm configured={configured} />
        </div>
      )}
    </div>
  );
}
