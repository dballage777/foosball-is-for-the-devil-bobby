// Official links for The Listener's Commentary (John Whittaker) and helpers for
// pointing readers at the episode(s) for a given book.
//
// LICENSING: we only ever LINK to (or officially embed) this content — never
// re-host it. See docs/audio-licensing.md. Exact per-episode embeds/links live
// in the `audio_resources` table once verified; this module provides the
// always-available, book-aware "browse episodes" fallback.

export const LISTENERS_COMMENTARY = {
  name: "The Listener's Commentary",
  host: "John Whittaker",
  // Verified official presences.
  site: "https://listenerscommentary.com/",
  applePodcasts:
    "https://podcasts.apple.com/us/podcast/the-listeners-bible-commentary/id1506039475",
  podbean: "https://listenerscommentary.podbean.com/",
};

/**
 * Build a link that browses the official site's episodes for a given book.
 * Uses the standard WordPress search (`?s=`) so it lands on that book's
 * episodes. The base is overridable via env for easy adjustment.
 */
export function browseBookUrl(bookName: string): string {
  const base =
    process.env.NEXT_PUBLIC_LC_SEARCH_BASE || "https://listenerscommentary.com/?s=";
  return `${base}${encodeURIComponent(bookName)}`;
}
