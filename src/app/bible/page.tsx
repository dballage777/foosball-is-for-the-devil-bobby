import Link from "next/link";
import type { Metadata } from "next";
import { booksByTestament } from "@/lib/bible/books";

export const metadata: Metadata = {
  title: "Bible",
  description:
    "Read the Bible by testament, book, and chapter. Navigate the Old and New Testaments.",
};

export default function BibleIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">The Bible</h1>
      <p className="mt-2 text-muted">Choose a book to begin reading.</p>

      <Testament title="Old Testament" testament="OT" />
      <Testament title="New Testament" testament="NT" />
    </div>
  );
}

function Testament({
  title,
  testament,
}: {
  title: string;
  testament: "OT" | "NT";
}) {
  const books = booksByTestament(testament);
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold text-accent">{title}</h2>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {books.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/bible/${b.slug}`}
              className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-brand hover:bg-brand-soft"
            >
              <span className="font-medium">{b.name}</span>
              <span className="text-xs text-muted">{b.chapters}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
