import Link from "next/link";
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { AuthGate } from "@/components/auth-gate";
import { getBook } from "@/lib/bible/books";

export const metadata: Metadata = {
  title: "My Study",
  description: "Your highlights, notes, bookmarks, and reading history.",
  robots: { index: false, follow: false },
};

export default async function MyStudyPage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">My Study</h1>
      {!user ? (
        <AuthGate feature="save highlights, notes, bookmarks, and reading history" />
      ) : (
        <Content />
      )}
    </div>
  );
}

async function Content() {
  const supabase = createClient();
  const [{ data: history }, { data: highlights }, { data: notes }] =
    await Promise.all([
      supabase
        .from("reading_history")
        .select("book_slug, chapter, last_read_at")
        .order("last_read_at", { ascending: false })
        .limit(6),
      supabase
        .from("bible_highlights")
        .select("id, book_slug, chapter, verse_start, verse_end, color, note")
        .order("updated_at", { ascending: false })
        .limit(20),
      supabase
        .from("bible_notes")
        .select("id, book_slug, chapter, verse_start, body, visibility")
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);

  const recent = history?.[0];
  const recentBook = recent ? getBook(recent.book_slug) : null;

  return (
    <div className="mt-6 space-y-10">
      {recentBook && recent && (
        <section className="rounded-xl border border-accent/40 bg-brand-soft/40 p-5">
          <p className="text-xs uppercase tracking-wide text-muted">
            Continue reading
          </p>
          <Link
            href={`/bible/${recent.book_slug}/${recent.chapter}`}
            className="font-serif text-xl text-brand hover:underline"
          >
            {recentBook.name} {recent.chapter} →
          </Link>
        </section>
      )}

      <Section title="Recent chapters">
        {history && history.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {history.map((h) => {
              const b = getBook(h.book_slug);
              return (
                <li key={`${h.book_slug}-${h.chapter}`}>
                  <Link
                    href={`/bible/${h.book_slug}/${h.chapter}`}
                    className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:bg-brand-soft"
                  >
                    {b?.name} {h.chapter}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>Chapters you read will appear here.</Empty>
        )}
      </Section>

      <Section title="Highlights">
        {highlights && highlights.length > 0 ? (
          <ul className="space-y-2">
            {highlights.map((h) => {
              const b = getBook(h.book_slug);
              return (
                <li key={h.id} className="text-sm">
                  <Link
                    href={`/bible/${h.book_slug}/${h.chapter}#v${h.verse_start}`}
                    className={`hl-${h.color} rounded px-1 font-medium hover:underline`}
                  >
                    {b?.name} {h.chapter}:{h.verse_start}
                    {h.verse_end > h.verse_start ? `–${h.verse_end}` : ""}
                  </Link>
                  {h.note && <span className="text-muted"> — {h.note}</span>}
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>Highlight verses in the reader to collect them here.</Empty>
        )}
      </Section>

      <Section title="Notes">
        {notes && notes.length > 0 ? (
          <ul className="space-y-2">
            {notes.map((n) => {
              const b = getBook(n.book_slug);
              return (
                <li
                  key={n.id}
                  className="rounded-lg border border-line bg-surface p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/bible/${n.book_slug}/${n.chapter}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {b?.name} {n.chapter}
                      {n.verse_start ? `:${n.verse_start}` : ""}
                    </Link>
                    <span className="rounded bg-brand-soft px-2 py-0.5 text-xs text-brand">
                      {n.visibility}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>Your notes — private by default — will appear here.</Empty>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl font-semibold text-brand">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
