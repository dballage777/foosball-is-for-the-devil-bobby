import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { isSupabaseConfigured, SITE } from "@/lib/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible/books";
import {
  addApplication,
  addDiscussionPost,
  leaveStudy,
} from "@/app/studies/actions";

export const metadata: Metadata = {
  title: "Study",
  // Private studies must never be indexed.
  robots: { index: false, follow: false },
};

interface Study {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  book_slug: string | null;
  chapter: number | null;
  passage_ref: string | null;
  privacy: string;
  invite_token: string;
}

/** Supabase infers embedded relations as arrays when there are no generated
 *  types; normalize to a single display name. */
type ProfileRef =
  | { display_name: string }
  | { display_name: string }[]
  | null
  | undefined;

function displayName(p: ProfileRef): string {
  if (!p) return "A member";
  if (Array.isArray(p)) return p[0]?.display_name ?? "A member";
  return p.display_name ?? "A member";
}

interface MemberRow {
  role: string;
  profiles: ProfileRef;
}
interface SharedRow {
  id: string;
  book_slug: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  color: string;
  note: string | null;
  profiles: ProfileRef;
}
interface PostRow {
  id: string;
  category: string;
  body: string;
  created_at: string;
  profiles: ProfileRef;
}
interface AppRow {
  id: string;
  body: string;
  created_at: string;
  profiles: ProfileRef;
}

export default async function StudyDashboard({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured()) redirect("/studies");
  const user = await getCurrentUser();
  if (!user) redirect("/account");

  const supabase = createClient();

  // RLS returns the row only if the user may see it.
  const { data: study } = await supabase
    .from("bible_studies")
    .select(
      "id, owner_id, name, description, book_slug, chapter, passage_ref, privacy, invite_token",
    )
    .eq("id", params.id)
    .maybeSingle();
  if (!study) notFound();
  const s = study as Study;

  const [membersRes, sharedRes, postsRes, appsRes] = await Promise.all([
    supabase
      .from("bible_study_members")
      .select("role, profiles(display_name)")
      .eq("study_id", s.id),
    supabase
      .from("shared_annotations")
      .select(
        "id, book_slug, chapter, verse_start, verse_end, color, note, profiles(display_name)",
      )
      .eq("study_id", s.id),
    supabase
      .from("study_discussion_posts")
      .select("id, category, body, created_at, profiles(display_name)")
      .eq("study_id", s.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("study_applications")
      .select("id, body, created_at, profiles(display_name)")
      .eq("study_id", s.id)
      .order("created_at", { ascending: true }),
  ]);

  const members = (membersRes.data ?? []) as unknown as MemberRow[];
  const shared = (sharedRes.data ?? []) as unknown as SharedRow[];
  const posts = (postsRes.data ?? []) as unknown as PostRow[];
  const apps = (appsRes.data ?? []) as unknown as AppRow[];

  const book = s.book_slug ? getBook(s.book_slug) : null;
  const passageHref = book && s.chapter ? `/bible/${book.slug}/${s.chapter}` : null;

  const stoodOut = posts.filter((p) => p.category === "stood_out");
  const discussion = posts.filter((p) => p.category === "discussion");

  const leave = leaveStudy.bind(null, s.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-muted">
        <Link href="/studies" className="hover:text-brand">
          Bible Studies
        </Link>{" "}
        / <span className="text-ink">{s.name}</span>
      </nav>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand">{s.name}</h1>
          {s.description && <p className="mt-1 text-muted">{s.description}</p>}
        </div>
        <form action={leave}>
          <button className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-brand-soft">
            Leave study
          </button>
        </form>
      </header>

      {/* Passage + apologetics */}
      <section className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted">
            Current passage
          </p>
          <p className="font-serif text-lg text-brand">
            {book ? book.name : "—"} {s.chapter ?? ""}{" "}
            {s.passage_ref ? `(${s.passage_ref})` : ""}
          </p>
        </div>
        {passageHref && (
          <Link
            href={passageHref}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Open passage →
          </Link>
        )}
        <Link
          href="/apologetics/resurrection"
          className="rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
        >
          Explore Apologetics →
        </Link>
      </section>

      {/* Invite */}
      <section className="mt-4 rounded-xl border border-line bg-surface p-4">
        <p className="text-xs uppercase tracking-wide text-muted">
          Invite friends &amp; family
        </p>
        <code className="mt-1 block break-all text-sm text-brand">
          {SITE.url}/studies/join/{s.invite_token}
        </code>
        <p className="mt-1 text-xs text-muted">
          Anyone with this link can request to join.{" "}
          {s.privacy === "private" && "This study is not publicly discoverable."}
        </p>
      </section>

      {/* Participants */}
      <section className="mt-6">
        <h2 className="font-serif text-xl font-semibold text-brand">
          Participants ({members.length})
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
          {members.map((m, i) => (
            <li
              key={i}
              className="rounded-full border border-line bg-surface px-3 py-1"
            >
              {displayName(m.profiles)}
              <span className="ml-1 text-xs text-muted">({m.role})</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Shared highlights */}
      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-brand">
          Shared Highlights
        </h2>
        {shared.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {shared.map((a) => {
              const b = getBook(a.book_slug);
              return (
                <li
                  key={a.id}
                  className="rounded-lg border border-line bg-surface p-3 text-sm"
                >
                  <span className={`hl-${a.color} rounded px-1 font-medium`}>
                    {b?.name} {a.chapter}:{a.verse_start}
                    {a.verse_end > a.verse_start ? `–${a.verse_end}` : ""}
                  </span>{" "}
                  <span className="text-muted">
                    shared by {displayName(a.profiles)}
                  </span>
                  {a.note && <p className="mt-1">{a.note}</p>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No shared highlights yet. Members can share a personal highlight from
            the reader.
          </p>
        )}
      </section>

      {/* What stood out */}
      <DiscussionColumn
        title="What stood out to you?"
        category="stood_out"
        studyId={s.id}
        posts={stoodOut}
      />

      {/* Applications */}
      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-brand">
          What will you obey / apply?
        </h2>
        <ul className="mt-3 space-y-2">
          {apps.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-line bg-surface p-3 text-sm"
            >
              <p className="font-medium text-brand">{displayName(a.profiles)}</p>
              <p className="mt-0.5">{a.body}</p>
            </li>
          ))}
        </ul>
        <form action={addApplication} className="mt-3 flex gap-2">
          <input type="hidden" name="study_id" value={s.id} />
          <input
            name="body"
            required
            placeholder="I will…"
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            Save
          </button>
        </form>
      </section>

      {/* Discussion */}
      <DiscussionColumn
        title="Discussion"
        category="discussion"
        studyId={s.id}
        posts={discussion}
      />
    </div>
  );
}

function DiscussionColumn({
  title,
  category,
  studyId,
  posts,
}: {
  title: string;
  category: "stood_out" | "discussion";
  studyId: string;
  posts: PostRow[];
}) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-brand">{title}</h2>
      <ul className="mt-3 space-y-2">
        {posts.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border border-line bg-surface p-3 text-sm"
          >
            <p className="font-medium text-brand">{displayName(p.profiles)}</p>
            <p className="mt-0.5 whitespace-pre-wrap">{p.body}</p>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="text-sm text-muted">
            No posts yet — start the conversation.
          </li>
        )}
      </ul>
      <form action={addDiscussionPost} className="mt-3 flex gap-2">
        <input type="hidden" name="study_id" value={studyId} />
        <input type="hidden" name="category" value={category} />
        <input
          name="body"
          required
          placeholder="Share your thoughts…"
          className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Post
        </button>
      </form>
    </section>
  );
}
