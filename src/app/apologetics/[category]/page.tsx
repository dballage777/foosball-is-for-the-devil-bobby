import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CATEGORIES,
  getCategory,
  WORLDVIEW_QUESTIONS,
  WORLDVIEW_TABLE,
} from "@/lib/apologetics/content";

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
            <p className="mt-2 font-medium text-ink">{t.summary}</p>
            {t.body && (
              <div className="mt-3 space-y-3 text-muted">
                {t.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            <Link
              href={`/resources?topic=${t.slug}`}
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
            >
              Find resources on this topic →
            </Link>
          </article>
        ))}
      </div>

      {category.slug === "worldviews" && <WorldviewTable />}

      <p className="mt-8 text-sm text-muted">
        Verified external resources are added incrementally; see the
        project&apos;s apologetics research documentation for sourcing standards.
      </p>
    </div>
  );
}

function WorldviewTable() {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl font-bold text-brand">
        Worldview Comparison
      </h2>
      <p className="mt-1 text-sm text-muted">
        A simplified, good-faith sketch — a starting point, not a substitute for
        studying each worldview in its own sources.
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-brand-soft/50 text-left">
              <th className="p-3 font-semibold text-brand">Question</th>
              {WORLDVIEW_TABLE.map((w) => (
                <th key={w.name} className="p-3 font-semibold text-brand">
                  {w.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WORLDVIEW_QUESTIONS.map((q) => (
              <tr key={q} className="border-t border-line align-top">
                <th scope="row" className="p-3 text-left font-medium text-ink">
                  {q}
                </th>
                {WORLDVIEW_TABLE.map((w) => (
                  <td key={w.name} className="p-3 text-muted">
                    {w.answers[q]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
