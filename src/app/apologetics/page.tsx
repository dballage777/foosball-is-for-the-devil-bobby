import Link from "next/link";
import type { Metadata } from "next";
import {
  APOLOGETICS_FOUNDATION,
  CASE_PATHWAY,
  CATEGORIES,
} from "@/lib/apologetics/content";

export const metadata: Metadata = {
  title: "Apologetics",
  description:
    "Explore the case for Christianity: does God exist, the reliability of the New Testament, the resurrection, objective morality, and more.",
  alternates: { canonical: "/apologetics" },
};

export default function ApologeticsHome() {
  const f = APOLOGETICS_FOUNDATION;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">Apologetics</h1>
      <p className="mt-2 max-w-3xl text-muted">
        Thoughtful reasons for the Christian hope — offered with gentleness and
        respect.
      </p>

      {/* Foundation */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card title="What Is Apologetics?" body={f.whatIsIt} />
        <Card title="Why Does It Matter?" body={f.whyItMatters} />
        <div className="rounded-xl border border-accent/40 bg-brand-soft/40 p-5">
          <h2 className="font-serif text-lg font-semibold text-brand">
            Biblical Foundation
          </h2>
          <p className="mt-2 text-sm text-muted">{f.keyVerse.idea}</p>
          <Link
            href={`/bible/${f.keyVerse.bookSlug}/${f.keyVerse.chapter}`}
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            Read {f.keyVerse.reference} →
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h2 className="font-serif text-lg font-semibold text-brand">
          How We Approach Hard Questions
        </h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
          {f.postures.map((p) => (
            <li key={p} className="flex gap-2">
              <span aria-hidden className="text-accent">
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Case for Christianity pathway */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold text-brand">
          The Case for Christianity
        </h2>
        <p className="mt-1 text-muted">
          A guided pathway from first questions to the evidence for the
          resurrection.
        </p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {CASE_PATHWAY.map((step, i) => (
            <li key={step.title}>
              <Link
                href={`/apologetics/${step.categorySlug}${step.topicSlug ? `#${step.topicSlug}` : ""}`}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-brand hover:bg-brand-soft"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Evidence categories */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold text-brand">
          Evidence & Topics
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/apologetics/${c.slug}`}
              className="group rounded-xl border border-line bg-surface p-5 hover:border-brand hover:shadow-sm"
            >
              <h3 className="font-serif text-lg font-semibold text-brand">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{c.summary}</p>
              <p className="mt-3 text-xs text-muted">
                {c.topics.length} topic{c.topics.length === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <Link
          href="/resources"
          className="rounded-lg border border-brand px-5 py-3 font-semibold text-brand hover:bg-brand-soft"
        >
          Browse the resource library →
        </Link>
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-serif text-lg font-semibold text-brand">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
