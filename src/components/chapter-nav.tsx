import Link from "next/link";
import { getBook } from "@/lib/bible/books";

interface Adj {
  slug: string;
  chapter: number;
}

export function ChapterNav({
  bookSlug,
  prev,
  next,
}: {
  bookSlug: string;
  prev: Adj | null;
  next: Adj | null;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <NavLink adj={prev} direction="prev" />
      <Link
        href={`/bible/${bookSlug}`}
        className="rounded-md border border-line px-3 py-2 text-sm font-medium hover:bg-brand-soft"
      >
        Chapters
      </Link>
      <NavLink adj={next} direction="next" />
    </div>
  );
}

function NavLink({ adj, direction }: { adj: Adj | null; direction: "prev" | "next" }) {
  if (!adj) {
    return <span className="w-24" aria-hidden />;
  }
  const book = getBook(adj.slug);
  const label = book ? `${book.name} ${adj.chapter}` : `${adj.chapter}`;
  return (
    <Link
      href={`/bible/${adj.slug}/${adj.chapter}`}
      className="flex-1 rounded-md border border-line px-3 py-2 text-sm font-medium hover:border-brand hover:bg-brand-soft"
      style={{ maxWidth: "10rem" }}
    >
      {direction === "prev" ? "← " : ""}
      <span className="truncate">{label}</span>
      {direction === "next" ? " →" : ""}
    </Link>
  );
}
