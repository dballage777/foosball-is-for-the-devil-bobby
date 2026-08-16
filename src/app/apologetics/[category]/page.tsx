import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, getCategory } from "@/lib/apologetics/content";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { category: string };
}): Metadata {
  const c = getCategory(params.category);
  if (!c) return { title: "Not found" };
  return {
    title: c.title,
    description: c.summary,
    alternates: { canonical: `/apologetics/${c.slug}` },
    openGraph: { title: c.title, description: c.summary },
  };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getCategory(params.category);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-muted">
        <Link href="/apologetics" className="hover:text-brand">
          Apologetics
        </Link>{" "}
        / <span className="text-ink">{category.title}</span>
      </nav>
      <h1 className="mt-2 font-serif text-3xl font-bold text-brand">
        {category.title}
      </h1>
      <p className="mt-2 text-muted">{category.summary}</p>

      <div className="mt-8 space-y-4">
        {category.topics.map((t) => (
          <article
            key={t.slug}
            id={t.slug}
            className="scroll-mt-24 rounded-xl border border-line bg-surface p-5"
          >
            <h2 className="font-serif text-xl font-semibold text-brand">
              {t.title}
            </h2>
            <p className="mt-2 text-muted">{t.summary}</p>
            <Link
              href={`/resources?topic=${t.slug}`}
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
            >
              Find resources on this topic →
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted">
        Deeper explanatory articles and verified resources are added
        incrementally; see the project&apos;s apologetics research documentation
        for sourcing standards.
      </p>
    </div>
  );
}
