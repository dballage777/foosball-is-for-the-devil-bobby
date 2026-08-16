import { getBook, isValidReference } from "@/lib/bible/books";
import {
  BibleProvider,
  BibleProviderError,
  BibleProviderInfo,
  Chapter,
} from "@/lib/bible/types";

/**
 * Public-domain provider backed by bible-api.com serving the World English
 * Bible (WEB). The WEB is public domain, so this is a REAL, license-free
 * source of genuine scripture text suitable for development and for users who
 * do not have an NIV license configured. It is NOT the NIV.
 *
 * This is a legitimate integration, not fake/placeholder text.
 */
const BASE_URL = "https://bible-api.com";
const TRANSLATION = "web";

export function createPublicDomainProvider(): BibleProvider {
  return {
    info(): BibleProviderInfo {
      return { id: "public-domain-web", versionLabel: "WEB", licensed: true };
    },

    async getChapter(bookSlug: string, chapter: number): Promise<Chapter> {
      const book = getBook(bookSlug);
      if (!book) {
        throw new BibleProviderError(`Unknown book: ${bookSlug}`, "not_found");
      }
      if (!isValidReference(bookSlug, chapter)) {
        throw new BibleProviderError(
          `Invalid reference: ${bookSlug} ${chapter}`,
          "invalid_reference",
        );
      }

      const reference = `${book.name} ${chapter}`;
      const url = `${BASE_URL}/${encodeURIComponent(reference)}?translation=${TRANSLATION}`;

      let res: Response;
      try {
        res = await fetch(url, {
          headers: { Accept: "application/json" },
          // Cache the WEB (public domain) response; safe to cache per source terms.
          next: { revalidate: 60 * 60 * 24 },
        });
      } catch {
        throw new BibleProviderError(
          "Bible provider is unreachable.",
          "provider_unavailable",
        );
      }

      if (!res.ok) {
        throw new BibleProviderError(
          `Provider returned ${res.status}.`,
          res.status === 404 ? "not_found" : "provider_unavailable",
        );
      }

      const data = (await res.json()) as {
        verses?: { verse: number; text: string }[];
      };
      if (!data.verses || data.verses.length === 0) {
        throw new BibleProviderError("No verses returned.", "not_found");
      }

      return {
        bookSlug,
        bookName: book.name,
        chapter,
        versionLabel: "WEB",
        copyright:
          "World English Bible (WEB). Public domain. Served via bible-api.com.",
        verses: data.verses.map((v) => ({
          number: v.verse,
          text: v.text.replace(/\s+/g, " ").trim(),
        })),
      };
    },
  };
}
