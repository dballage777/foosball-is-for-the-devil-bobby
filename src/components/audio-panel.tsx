import type { AudioResource } from "@/lib/data/reader";
import { LISTENERS_COMMENTARY, browseBookUrl } from "@/lib/audio/listeners-commentary";

/**
 * Chapter audio. Shows verified chapter/range-specific mappings (official embed
 * when the provider's terms allow it, otherwise an official link), plus an
 * always-available book-aware link to browse the official podcast. We never
 * re-host audio.
 */
export function AudioPanel({
  bookName,
  resources,
}: {
  bookName: string;
  resources: AudioResource[];
}) {
  const browseUrl = browseBookUrl(bookName);

  return (
    <section className="mt-6 rounded-xl border border-line bg-surface p-4">
      <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand">
        <span aria-hidden>🎧</span> Chapter Audio
      </h2>
      <p className="mt-1 text-xs text-muted">
        From {LISTENERS_COMMENTARY.name} by {LISTENERS_COMMENTARY.host}
      </p>

      {resources.length > 0 && (
        <ul className="mt-3 space-y-4">
          {resources.map((r) => (
            <li key={r.page_url}>
              <p className="text-sm font-medium">{r.title}</p>
              {r.description && <p className="text-sm text-muted">{r.description}</p>}
              {r.embed_url ? (
                <div className="mt-2 overflow-hidden rounded-lg border border-line">
                  <iframe
                    src={r.embed_url}
                    title={r.title}
                    loading="lazy"
                    className="h-40 w-full"
                    allow="encrypted-media; clipboard-write"
                  />
                </div>
              ) : (
                <a
                  href={r.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
                >
                  Listen at {r.provider} →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <a
          href={browseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          Browse {bookName} episodes on {LISTENERS_COMMENTARY.name} →
        </a>
        <a
          href={LISTENERS_COMMENTARY.applePodcasts}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-brand hover:underline"
        >
          Apple Podcasts
        </a>
      </div>
    </section>
  );
}
