import Link from "next/link";
import { SITE } from "@/lib/config";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-brand-soft/60 to-parchment">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="font-serif text-sm uppercase tracking-widest text-accent">
            {SITE.name}
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-serif text-4xl font-bold text-brand sm:text-5xl">
            Read Scripture. Study together. Examine the evidence.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Open the Bible, highlight and take notes, gather friends for a
            collaborative study, decide how to obey — then explore the case for
            Christianity with trusted apologetics resources.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/bible"
              className="rounded-lg bg-brand px-6 py-3 font-semibold text-white shadow-sm hover:opacity-90"
            >
              Read the Bible
            </Link>
            <Link
              href="/studies/new"
              className="rounded-lg border border-brand px-6 py-3 font-semibold text-brand hover:bg-brand-soft"
            >
              Create a Bible Study
            </Link>
            <Link
              href="/apologetics"
              className="rounded-lg border border-line px-6 py-3 font-semibold text-ink hover:bg-surface"
            >
              Explore Apologetics
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            <Link href="/my-study" className="underline hover:text-brand">
              Continue studying →
            </Link>{" "}
            (sign in to pick up where you left off)
          </p>
        </div>
      </section>

      {/* The rhythm */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-serif text-2xl font-bold text-brand">
          Read → Study → Discuss → Apply → Explore
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-xl border border-line bg-surface p-6 transition hover:border-brand hover:shadow-sm"
            >
              <div className="text-2xl" aria-hidden>
                {f.icon}
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold text-brand">
                {f.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{f.body}</p>
              <span className="mt-3 inline-block text-sm font-medium text-accent group-hover:underline">
                {f.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: "📖",
    title: "Bible Reader",
    body: "Navigate by testament, book, and chapter with previous/next controls. Comfortable, distraction-free reading.",
    cta: "Open the Bible",
    href: "/bible",
  },
  {
    icon: "🎧",
    title: "Chapter Audio",
    body: "Chapter-specific background audio from official sources, linked or embedded — never re-hosted.",
    cta: "Learn more",
    href: "/bible",
  },
  {
    icon: "🖍️",
    title: "Highlights & Notes",
    body: "Highlight verses in six colors and attach private notes. Your private notes stay private.",
    cta: "Your study",
    href: "/my-study",
  },
  {
    icon: "👥",
    title: "Collaborative Studies",
    body: "Create a study, invite friends and family with a link, share highlights, and discuss together.",
    cta: "Bible studies",
    href: "/studies",
  },
  {
    icon: "🧭",
    title: "Apply the Word",
    body: "Record what stood out and what you intend to obey — turning reading into action.",
    cta: "Bible studies",
    href: "/studies",
  },
  {
    icon: "🔎",
    title: "Apologetics",
    body: "Explore evidence for Christianity across 16 topics, with a guided Case for Christianity pathway.",
    cta: "Explore apologetics",
    href: "/apologetics",
  },
];
