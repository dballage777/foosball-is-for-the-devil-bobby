import { getBook, isValidReference } from "@/lib/bible/books";
import {
  BibleProvider,
  BibleProviderError,
  BibleProviderInfo,
  Chapter,
} from "@/lib/bible/types";

/**
 * API.Bible provider (scripture.api.bible, American Bible Society).
 *
 * IMPORTANT LICENSING NOTE: an API key alone does NOT grant rights to the NIV.
 * The NIV is licensed by Biblica/Zondervan and must be enabled for your key,
 * with its own attribution and usage terms. See docs/bible-licensing.md. This
 * provider is only correct to use with a version id you are licensed to serve.
 *
 * Configure via env:
 *   BIBLE_API_KEY             (required)
 *   BIBLE_DEFAULT_VERSION_ID  (the bible/version id to request)
 */
const BASE_URL = "https://api.scripture.api.bible/v1";

export function createApiBibleProvider(): BibleProvider {
  const apiKey = process.env.BIBLE_API_KEY;
  const versionId = process.env.BIBLE_DEFAULT_VERSION_ID;

  return {
    info(): BibleProviderInfo {
      return {
        id: "apibible",
        versionLabel: versionId ? versionId : "unconfigured",
        // We cannot assert "licensed" generically; depends on the version id.
        licensed: Boolean(apiKey && versionId),
      };
    },

    async getChapter(bookSlug: string, chapter: number): Promise<Chapter> {
      if (!apiKey || !versionId) {
        throw new BibleProviderError(
          "API.Bible is not configured. Set BIBLE_API_KEY and BIBLE_DEFAULT_VERSION_ID.",
          "not_configured",
        );
      }
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

      // API.Bible chapter id format is "<OSIS>.<chapter>", e.g. "JHN.3".
      const chapterId = `${book.osis}.${chapter}`;
      const url = new URL(
        `${BASE_URL}/bibles/${versionId}/chapters/${chapterId}`,
      );
      url.searchParams.set("content-type", "json");
      url.searchParams.set("include-verse-numbers", "true");
      url.searchParams.set("include-notes", "false");
      url.searchParams.set("include-titles", "false");

      let res: Response;
      try {
        res = await fetch(url.toString(), {
          headers: { "api-key": apiKey, Accept: "application/json" },
          next: { revalidate: 60 * 60 },
        });
      } catch {
        throw new BibleProviderError(
          "Bible provider is unreachable.",
          "provider_unavailable",
        );
      }

      if (res.status === 401 || res.status === 403) {
        throw new BibleProviderError(
          "Not authorized for this Bible version. Check your license/key.",
          "unauthorized",
        );
      }
      if (res.status === 404) {
        throw new BibleProviderError("Chapter not found.", "not_found");
      }
      if (!res.ok) {
        throw new BibleProviderError(
          `Provider returned ${res.status}.`,
          "provider_unavailable",
        );
      }

      const payload = (await res.json()) as {
        data?: { content?: unknown; copyright?: string };
      };
      const verses = parseApiBibleContent(payload.data?.content);
      if (verses.length === 0) {
        throw new BibleProviderError("No verses returned.", "not_found");
      }

      return {
        bookSlug,
        bookName: book.name,
        chapter,
        versionLabel: versionId,
        copyright:
          payload.data?.copyright?.trim() ||
          "Text provided under license via API.Bible. See publisher attribution terms.",
        verses,
      };
    },
  };
}

/**
 * API.Bible's JSON content is a nested block structure. We walk it and group
 * text by verse number. Kept defensive: shape can vary by version.
 */
function parseApiBibleContent(content: unknown): { number: number; text: string }[] {
  const byVerse = new Map<number, string>();
  let current = 0;

  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.name === "verse" && n.attrs && typeof n.attrs === "object") {
      const num = Number((n.attrs as Record<string, unknown>).number);
      if (Number.isFinite(num)) current = num;
    }
    if (n.type === "text" && typeof n.text === "string" && current > 0) {
      byVerse.set(current, ((byVerse.get(current) ?? "") + n.text));
    }
    const items = n.items;
    if (Array.isArray(items)) items.forEach(walk);
  };

  if (Array.isArray(content)) content.forEach(walk);
  else walk(content);

  return Array.from(byVerse.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([number, text]) => ({ number, text: text.replace(/\s+/g, " ").trim() }))
    .filter((v) => v.text.length > 0);
}
