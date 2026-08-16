import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import {
  VERIFIED_SOURCES,
  resourceActionLabel,
  type VerifiedResource,
} from "@/lib/apologetics/sources";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "A searchable library of verified apologetics resources — articles, podcasts, videos, and books from official sources.",
  alternates: { canonical: "/resources" },
};

interface ResourceRow extends VerifiedResource {
  featured?: boolean;
}

async function loadResources(query: string, type: string): Promise<ResourceRow[]> {
  if (!isSupabaseConfigured()) {
    return VERIFIED_SOURCES.filter(
      (r) =>
        (!type || r.type === type) &&
        (!query || r.title.toLowerCase().includes(query.toLowerCase())),
    );
  }
  try {
    const supabase = createClient();
    let q = supabase
      .from("apologetics_resources")
      .select(
        "title, description, resource_type, url, featured, apologetics_sources(name)",
      )
      .order("featured", { ascending: false })
      .limit(60);
    if (type) q = q.eq("resource_type", type);
    if (query) q = q.ilike("title", `%${query}%`);
    const { data } = await q;
    if (!data) return [];
    return (data as unknown[]).map((row) => {
      const r = row as {
        title: string;
        description: string | null;
        resource_type: string;
        url: string;
        featured: boolean;
        apologetics_sources?: { name: string };
      };
      return {
        title: r.title,
        description: r.description ?? "",
        type: r.resource_type,
        url: r.url,
        sourceName: r.apologetics_sources?.name ?? "",
        featured: r.featured,
      };
    });
  } catch {
    return VERIFIED_SOURCES;
  }
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; topic?: string };
}) {
  const query = searchParams.q ?? "";
  const type = searchParams.type ?? "";
  const resources = await loadResources(query, type);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">
        Resource Library
      </h1>
      <p className="mt-2 max-w-3xl text-muted">
        Verified resources from official apologetics sources. Every link points
        to the resource&apos;s official owner — nothing here is copied or
        re-hosted.
      </p>

      {/* Filters (GET form — works without JS) */}
      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Title contains…"
            className="rounded-md border border-line bg-surface px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Type</span>
          <select
            name="type"
            defaultValue={type}
            className="rounded-md border border-line bg-surface px-3 py-2"
          >
            <option value="">All types</option>
            <option value="external_resource">Website / Article</option>
            <option value="spotify_show">Spotify show</option>
            <option value="youtube_channel">YouTube channel</option>
            <option value="youtube_video">YouTube video</option>
            <option value="book">Book</option>
            <option value="debate">Debate</option>
            <option value="course">Course</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:opacity-90"
        >
          Filter
        </button>
      </form>

      {!isSupabaseConfigured() && (
        <p className="mt-4 rounded-md border border-accent/40 bg-brand-soft/40 px-3 py-2 text-sm text-muted">
          Showing verified official sources. The full searchable library
          activates once the database is configured and populated.
        </p>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <li
            key={r.url}
            className="flex flex-col rounded-xl border border-line bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-serif text-base font-semibold text-brand">
                {r.title}
              </h2>
              {r.featured && (
                <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">
                  Featured
                </span>
              )}
            </div>
            {r.sourceName && (
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                {r.sourceName} · {r.type.replace(/_/g, " ")}
              </p>
            )}
            {r.description && (
              <p className="mt-2 flex-1 text-sm text-muted">{r.description}</p>
            )}
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
            >
              {resourceActionLabel(r.type)} →
            </a>
          </li>
        ))}
      </ul>

      {resources.length === 0 && (
        <p className="mt-8 text-muted">No resources match your filters yet.</p>
      )}
    </div>
  );
}
