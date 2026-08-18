// Official links for The Listener's Commentary (John Whittaker) and helpers for
// pointing readers at the episodes for a given book.
//
// LICENSING: we only ever LINK to (or officially embed) this content — never
// re-host it. See docs/audio-licensing.md.

export const LISTENERS_COMMENTARY = {
  name: "The Listener's Commentary",
  host: "John Whittaker",
  site: "https://listenerscommentary.com/",
  applePodcasts:
    "https://podcasts.apple.com/us/podcast/the-listeners-bible-commentary/id1506039475",
  podbean: "https://listenerscommentary.podbean.com/",
};

const SITE = "https://listenerscommentary.com";

/**
 * Verified canonical book pages on listenerscommentary.com. Each key is our
 * book slug; the value is the site's dedicated page for that book (which lists
 * all of that book's episodes). URLs confirmed from the site's own navigation.
 *
 * New Testament is fully mapped. Old Testament pages follow the same pattern
 * but are not yet confirmed, so unmapped books fall back to the site search.
 * Note: 1 & 2 Thessalonians share a single combined page on the site.
 */
export const LC_BOOK_PAGES: Record<string, string> = {
  matthew: `${SITE}/matthew/`,
  mark: `${SITE}/mark/`,
  luke: `${SITE}/luke/`,
  john: `${SITE}/john/`,
  acts: `${SITE}/acts/`,
  romans: `${SITE}/romans/`,
  "1-corinthians": `${SITE}/1-corinthians/`,
  "2-corinthians": `${SITE}/2-corinthians/`,
  galatians: `${SITE}/galatians/`,
  ephesians: `${SITE}/ephesians/`,
  philippians: `${SITE}/philippians/`,
  colossians: `${SITE}/colossians/`,
  "1-thessalonians": `${SITE}/thessalonians/`,
  "2-thessalonians": `${SITE}/thessalonians/`,
  "1-timothy": `${SITE}/1-timothy/`,
  "2-timothy": `${SITE}/2-timothy/`,
  titus: `${SITE}/titus/`,
  philemon: `${SITE}/philemon/`,
  hebrews: `${SITE}/hebrews/`,
  james: `${SITE}/james/`,
  "1-peter": `${SITE}/1-peter/`,
  "2-peter": `${SITE}/2-peter/`,
  "1-john": `${SITE}/1-john/`,
  "2-john": `${SITE}/2-john/`,
  "3-john": `${SITE}/3-john/`,
  jude: `${SITE}/jude/`,
  revelation: `${SITE}/revelation/`,
};

/**
 * The best link to the episodes for a book: the verified canonical book page
 * when known, otherwise the official site search for the book name.
 */
export function episodeListUrl(bookSlug: string, bookName: string): {
  url: string;
  exact: boolean;
} {
  const page = LC_BOOK_PAGES[bookSlug];
  if (page) return { url: page, exact: true };
  const base =
    process.env.NEXT_PUBLIC_LC_SEARCH_BASE || "https://listenerscommentary.com/?s=";
  return { url: `${base}${encodeURIComponent(bookName)}`, exact: false };
}
