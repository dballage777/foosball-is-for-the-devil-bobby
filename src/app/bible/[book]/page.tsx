import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook } from "@/lib/bible/books";

export function generateMetadata({
  params,
}: {
  params: { book: string };
}): Metadata {
  const book = getBook(params.book);
  if (!book) return { title: "Book not found" };
  return {
    title: book.name,
    description: `Read ${book.name}. Select a chapter (1–${book.chapters}).`,
  };
}

export default function BookChapterPicker({
  params,
}: {
  params: { book: string };
}) {
  const book = getBook(params.book);
  if (!book) notFound();

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-muted">
        <Link href="/bible" className="hover:text-brand">
          Bible
        </Link>{" "}
        / <span className="text-ink">{book.name}</span>
      </nav>
      <h1 className="mt-2 font-serif text-3xl font-bold text-brand">
        {book.name}
      </h1>
      <p className="mt-1 text-muted">Select a chapter.</p>

      <ul className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {chapters.map((c) => (
          <li key={c}>
            <Link
              href={`/bible/${book.slug}/${c}`}
              className="flex h-11 items-center justify-center rounded-lg border border-line bg-surface font-medium hover:border-brand hover:bg-brand-soft"
            >
              {c}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
