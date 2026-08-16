import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { joinStudy } from "@/app/studies/actions";

export const metadata: Metadata = {
  title: "Join a Bible Study",
  robots: { index: false, follow: false },
};

export default async function JoinTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;
  const join = joinStudy.bind(null, params.token);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-serif text-3xl font-bold text-brand">
        You&apos;re invited to a Bible study
      </h1>

      {!configured ? (
        <p className="mt-4 text-muted">
          This platform isn&apos;t fully configured yet.
        </p>
      ) : !user ? (
        <div className="mt-6">
          <p className="text-muted">
            Sign in or create an account to join. You&apos;ll return here
            afterward.
          </p>
          <Link
            href={`/account?next=/studies/join/${params.token}`}
            className="mt-4 inline-block rounded-md bg-brand px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Sign in to join →
          </Link>
        </div>
      ) : (
        <form action={join} className="mt-6">
          <p className="text-muted">
            Click below to join this study. The organizer will see you as a
            member.
          </p>
          <button
            type="submit"
            className="mt-4 rounded-md bg-brand px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Join study
          </button>
        </form>
      )}
    </div>
  );
}
