import type { AudioResource } from "@/lib/data/reader";

/**
 * Renders chapter audio using the OFFICIAL embed when the provider's terms
 * allow it, otherwise a link to the official page. We never re-host audio.
 */
export function AudioPanel({ resources }: { resources: AudioResource[] }) {
  return (
    <section className="mt-6 rounded-xl border border-line bg-surface p-4">
      <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand">
        <span aria-hidden>🎧</span> Chapter Audio
      </h2>
      <ul className="mt-3 space-y-4">
        {resources.map((r) => (
          <li key={r.page_url}>
            <p className="text-sm font-medium">{r.title}</p>
            {r.description && (
              <p className="text-sm text-muted">{r.description}</p>
            )}
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
    </section>
  );
}
