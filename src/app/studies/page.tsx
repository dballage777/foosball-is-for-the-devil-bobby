import Link from "next/link";
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { AuthGate } from "@/components/auth-gate";

export const metadata: Metadata = {
  title: "Bible Studies",
  description: "Create or join a collaborative Bible study with friends and family.",
  robots: { index: false, follow: false },
};

interface StudyRow {
  id: string;
  name: string;
  description: string | null;
  book_slug: string | null;
  chapter: number | null;
  privacy: string;
}

export default async function StudiesPage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-brand">Bible Studies</h1>
        {user && (
          <div className="flex gap-2">
            <Link
              href="/studies/new"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Create study
            </Link>
            <Link
              href="/studies/join"
              className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-brand-soft"
            >
              Join with link
            </Link>
          </div>
        )}
      </div>

      {!user ? (
        <AuthGate feature="create and join Bible studies" />
      ) : (
        <MyStudies />
      )}
    </div>
  );
}

async function MyStudies() {
  const supabase = createClient();
  // RLS ensures only studies the user belongs to (or public) are returned.
  const { data } = await supabase
    .from("bible_studies")
    .select("id, name, description, book_slug, chapter, privacy")
    .order("updated_at", { ascending: false });
  const studies = (data as StudyRow[]) ?? [];

  if (studies.length === 0) {
    return (
      <p className="mt-8 text-muted">
        You aren&apos;t in any studies yet. Create one, or open an invitation
        link a friend shared with you.
      </p>
    );
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {studies.map((s) => (
        <li key={s.id}>
          <Link
            href={`/studies/${s.id}`}
            className="block rounded-xl border border-line bg-surface p-5 hover:border-brand hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-brand">
                {s.name}
              </h2>
              <span className="rounded bg-brand-soft px-2 py-0.5 text-xs text-brand">
                {s.privacy}
              </span>
            </div>
            {s.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {s.description}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
