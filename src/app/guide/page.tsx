import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "How to use the Bible reader, highlights and notes, collaborative Bible studies, apologetics, and how your privacy is protected.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-reading px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">
        How to use {SITE.name}
      </h1>
      <p className="mt-2 text-muted">
        A quick tour of everything here — reading, studying, gathering a group,
        exploring the evidence, and how your information is kept private.
      </p>

      {/* Contents */}
      <nav className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm">
        <p className="font-semibold text-brand">On this page</p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-accent hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="rhythm" title="The rhythm">
        <p>
          The idea is a simple flow: <strong>Read</strong> Scripture →{" "}
          <strong>Study</strong> it (highlight &amp; take notes) →{" "}
          <strong>Discuss</strong> it with others → decide how to{" "}
          <strong>Apply</strong> it → <strong>Explore</strong> the reasons for
          the faith when questions come up. You can do just the parts you want.
        </p>
      </Section>

      <Section id="reading" title="Reading the Bible">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Open <Link href="/bible" className="text-accent hover:underline">Bible</Link> and pick a
            book (Old or New Testament).
          </li>
          <li>Choose a chapter.</li>
          <li>
            Use the <strong>Previous / Next</strong> buttons to move through
            chapters, or <strong>Chapters</strong> to jump around.
          </li>
        </ol>
        <p className="mt-2 text-sm text-muted">
          The text is the New International Version (NIV), served under license
          with its copyright shown beneath each chapter.
        </p>
      </Section>

      <Section id="highlights" title="Highlighting & notes">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            While reading, <strong>tap a verse</strong> to select it. Tap more
            verses to extend the selection; a toolbar appears with the reference.
          </li>
          <li>
            Pick a <strong>highlight color</strong> (six options) to mark the
            verse(s).
          </li>
          <li>
            Tap <strong>Note</strong> to write a note, and choose who can see it:
            <strong> Private</strong> (only you — the default),{" "}
            <strong>Study</strong>, or <strong>Public</strong>.
          </li>
          <li>
            <strong>Bookmark</strong> a spot, or <strong>Copy</strong> the
            reference to paste elsewhere.
          </li>
        </ol>
        <p className="mt-2 text-sm text-muted">
          Everything you save appears under{" "}
          <Link href="/my-study" className="text-accent hover:underline">My Study</Link>, including
          &ldquo;Continue reading.&rdquo; You need a free account to save
          (see below).
        </p>
      </Section>

      <Section id="audio" title="Chapter audio">
        <p>
          Each chapter shows a <strong>Chapter Audio</strong> panel linking to
          the matching teaching from <em>The Listener&apos;s Commentary</em> by
          John Whittaker. We link to the official episodes — we never re-host
          them.
        </p>
      </Section>

      <Section id="create-study" title="Setting up a Bible study">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Go to{" "}
            <Link href="/studies" className="text-accent hover:underline">Bible Studies</Link> and
            click <strong>Create study</strong>.
          </li>
          <li>
            Give it a <strong>name</strong> and (optionally) a description, the
            book/chapter you&apos;ll study, a date, and a schedule.
          </li>
          <li>
            Choose <strong>Private</strong> (invite-only, not discoverable) or{" "}
            <strong>Public</strong>.
          </li>
          <li>Click <strong>Create study</strong> — you become the owner.</li>
          <li>
            On the study page you&apos;ll see an{" "}
            <strong>invite link</strong>. Send it to friends or family. When they
            open it and sign in, they join automatically.
          </li>
          <li>
            Everyone can open the passage, <strong>share a highlight</strong> from
            the reader, post under <strong>&ldquo;What stood out?&rdquo;</strong>,
            record <strong>&ldquo;What will you obey / apply?&rdquo;</strong>, and
            take part in the <strong>discussion</strong>.
          </li>
        </ol>
        <p className="mt-2 text-sm text-muted">
          You can leave a study anytime with <strong>Leave study</strong>. To
          join one someone shared with you, open their link or use{" "}
          <Link href="/studies/join" className="text-accent hover:underline">Join with link</Link>.
        </p>
      </Section>

      <Section id="apologetics" title="Apologetics & resources">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/apologetics" className="text-accent hover:underline">Apologetics</Link>{" "}
            covers 16 evidence topics with plain-language articles, a worldview
            comparison, and a guided <em>Case for Christianity</em> pathway.
          </li>
          <li>
            Each topic links to the{" "}
            <Link href="/resources" className="text-accent hover:underline">Resource Library</Link>,
            filtered to that topic. You can also search and filter by type.
          </li>
          <li>
            Every resource links to its official owner (articles, podcasts,
            videos, books). Nothing is copied or re-hosted.
          </li>
        </ul>
      </Section>

      <Section id="accounts" title="Accounts">
        <p>
          Reading the Bible and browsing apologetics need <strong>no account</strong>.
          To save highlights, notes, and bookmarks — or to create/join a study —
          make a free account on the{" "}
          <Link href="/account" className="text-accent hover:underline">Account</Link> page. Forgot
          your password? Use the <strong>&ldquo;Forgot password?&rdquo;</strong>{" "}
          link to reset it by email.
        </p>
      </Section>

      <Section id="privacy" title="Your privacy">
        <p>
          Your privacy is taken seriously, and here&apos;s the plain truth about
          it:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Signing up doesn&apos;t expose your information.</strong>{" "}
            Other users only ever see your display name and whatever you
            deliberately choose to share into a study.
          </li>
          <li>
            <strong>Private is private.</strong> Notes are private by default,
            and private studies aren&apos;t discoverable. This is enforced at the
            database level, not just in the app — no other user can read your
            private notes or a study you weren&apos;t invited to.
          </li>
          <li>
            <strong>We don&apos;t sell or share your data.</strong> There are no
            ads, no advertising trackers, and your information is never sold or
            handed to third parties.
          </li>
          <li>
            <strong>We keep only what the app needs</strong> to work: your email
            (to sign you in) and the content you create (your highlights, notes,
            and studies). You can stop using the account at any time.
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted">
          Accounts and data are handled through Supabase (authentication and a
          private database). See{" "}
          <Link href="/about" className="text-accent hover:underline">About</Link> for more on how
          the site is built.
        </p>
      </Section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/bible"
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:opacity-90"
        >
          Start reading
        </Link>
        <Link
          href="/studies/new"
          className="rounded-lg border border-brand px-5 py-3 font-semibold text-brand hover:bg-brand-soft"
        >
          Create a study
        </Link>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: "rhythm", title: "The rhythm" },
  { id: "reading", title: "Reading the Bible" },
  { id: "highlights", title: "Highlighting & notes" },
  { id: "audio", title: "Chapter audio" },
  { id: "create-study", title: "Setting up a Bible study" },
  { id: "apologetics", title: "Apologetics & resources" },
  { id: "accounts", title: "Accounts" },
  { id: "privacy", title: "Your privacy" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-8 scroll-mt-24">
      <h2 className="font-serif text-xl font-semibold text-brand">{title}</h2>
      <div className="mt-2 space-y-2 text-ink">{children}</div>
    </section>
  );
}
