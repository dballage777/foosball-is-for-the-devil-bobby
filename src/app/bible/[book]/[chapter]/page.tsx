import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { adjacentChapter, getBook, isValidReference } from "@/lib/bible/books";
import { getBibleProvider } from "@/lib/bible/service";
import { BibleProviderError } from "@/lib/bible/types";
import { getChapterAudio, getRelatedApologetics } from "@/lib/data/reader";
import { getChapterAnnotations } from "@/lib/data/annotations";
import { ChapterNav } from "@/components/chapter-nav";
import { AudioPanel } from "@/components/audio-panel";
import { ReaderVerses } from "@/components/reader-verses";

interface Params {
  params: { book: string; chapter: string };
}

export function generateMetadata({ params }: Params): Metadata {
  const book = getBook(params.book);
  const chapter = Number(params.chapter);
  if (!book || !isValidReference(params.book, chapter)) {
    return { title: "Passage not found" };
  }
  return {
    title: `${book.name} ${chapter}`,
    description: `Read ${book.name} chapter ${chapter}.`,
    alternates: { canonical: `/bible/${book.slug}/${chapter}` },
  };
}

export default async function ChapterReader({ params }: Params) {
  const book = getBook(params.book);
  const chapter = Number(params.chapter);
  if (!book || !isValidReference(params.book, chapter)) notFound();

  const prev = adjacentChapter(book.slug, chapter, "prev");
  const next = adjacentChapter(book.slug, chapter, "next");

  const [audio, related, annotations] = await Promise.all([
    getChapterAudio(book.slug, chapter),
    getRelatedApologetics(book.slug, chapter),
    getChapterAnnotations(book.slug, chapter),
  ]);

  let content: React.ReactNode;
  try {
    const provider = getBibleProvider();
    const data = await provider.getChapter(book.slug, chapter);
    content = (
      <ReaderVerses
        bookSlug={book.slug}
        bookName={book.name}
        chapter={chapter}
        versionLabel={data.versionLabel}
        copyright={data.copyright}
        verses={data.verses}
        annotations={annotations}
      />
    );
  } catch (err) {
    content = <ProviderError error={err} />;
  }

  return (
    <div className="mx-auto max-w-reading px-4 py-8">
      <nav className="text-sm text-muted">
        <Link href="/bible" className="hover:text-brand">
          Bible
        </Link>{" "}
        /{" "}
        <Link href={`/bible/${book.slug}`} className="hover:text-brand">
          {book.name}
        </Link>{" "}
        / <span className="text-ink">{chapter}</span>
      </nav>

      <h1 className="mt-2 font-serif text-3xl font-bold text-brand">
        {book.name} {chapter}
      </h1>

      <ChapterNav bookSlug={book.slug} prev={prev} next={next} />

      <AudioPanel bookName={book.name} resources={audio} />

      {content}

      {related.length > 0 && (
        <section className="mt-10 rounded-xl border border-line bg-surface p-5">
          <h2 className="font-serif text-lg font-semibold text-brand">
            Related Apologetics
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {related.map((r) => (
              <li key={r.topicSlug}>
                <Link
                  href={`/apologetics/${r.categorySlug}#${r.topicSlug}`}
                  className="font-medium text-accent hover:underline"
                >
                  {r.topicTitle}
                </Link>
                {r.note && <span className="text-muted"> — {r.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ChapterNav bookSlug={book.slug} prev={prev} next={next} />
    </div>
  );
}

function ProviderError({ error }: { error: unknown }) {
  const known = error instanceof BibleProviderError ? error.code : null;
  const message =
    known === "not_configured"
      ? "No Bible provider is configured yet. Set BIBLE_PROVIDER and any required keys (see docs/bible-licensing.md)."
      : known === "unauthorized"
        ? "The configured Bible version is not licensed for this key. See docs/bible-licensing.md."
        : "This chapter could not be loaded right now. Please try again shortly.";
  return (
    <div className="mt-6 rounded-xl border border-accent/40 bg-brand-soft/40 p-5 text-sm">
      <p className="font-medium text-brand">Scripture temporarily unavailable</p>
      <p className="mt-1 text-muted">{message}</p>
    </div>
  );
}
