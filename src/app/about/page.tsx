import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description:
    "About this Bible reading, collaborative study, and Christian apologetics platform.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-reading px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">About {SITE.name}</h1>
      <div className="prose mt-4 space-y-4 text-ink">
        <p>
          {SITE.name} is a place to read Scripture, study it with others, and
          examine the reasons for the Christian faith. The rhythm is simple:
          <strong> read</strong> the passage, <strong>understand</strong> it,
          <strong> highlight</strong> and take notes, <strong>study</strong> with
          friends, <strong>discuss</strong> what stood out, decide how to{" "}
          <strong>apply</strong> it, and then <strong>explore</strong> the
          evidence when questions arise.
        </p>
        <h2 className="font-serif text-xl font-semibold text-brand">
          How Scripture is provided
        </h2>
        <p>
          The Bible text is served through a provider abstraction so that a
          properly licensed edition (such as the NIV) can be used where the
          license permits. Copyrighted translations are never copied into this
          project or scraped from other sites. Where no licensed edition is
          configured, a public-domain translation is used.
        </p>
        <h2 className="font-serif text-xl font-semibold text-brand">
          How resources are handled
        </h2>
        <p>
          Apologetics resources link to their official owners. We do not copy
          full articles, books, podcast transcripts, or videos, and we do not
          fabricate resources — every link points to a real, verified source.
        </p>
        <p>
          <Link href="/bible" className="text-accent underline">
            Start reading →
          </Link>
        </p>
      </div>
    </div>
  );
}
