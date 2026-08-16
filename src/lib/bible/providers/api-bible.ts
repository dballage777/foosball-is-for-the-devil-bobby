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
 * Default target version is the **Berean Standard Bible (BSB)** — a modern,
 * freely-licensed translation that reads close to the NIV in style but carries
 * no license restriction. (The copyrighted NIV can only be served here if you
 * are separately licensed for it; see docs/bible-licensing.md.)
 *
 * Configure via env:
 *   BIBLE_API_KEY             (required)
 *   BIBLE_VERSION_ABBR        (abbreviation to resolve, default "BSB")
 *   BIBLE_DEFAULT_VERSION_ID  (optional: pin an exact bible id, skips lookup)
 */
const BASE_URL = "https://api.scripture.api.bible/v1";

export interface CatalogBible {
  id: string;
  abbreviation?: string;
  abbreviationLocal?: string;
  name?: string;
}

/**
 * Pure selector: choose a bible id from the API.Bible catalog given either an
 * exact id or a human abbreviation/name. Exported for unit testing so we never
 * hard-code (and never fabricate) a specific version id.
 */
export function selectBibleId(
  catalog: CatalogBible[],
  target: { id?: string; abbr?: string },
): string | null {
  if (target.id) {
    const byId = catalog.find((b) => b.id === target.id);
    if (byId) return byId.id;
    // If an explicit id was given but not in the catalog, trust it anyway.
    return target.id;
  }
  const abbr = (target.abbr ?? "").trim().toLowerCase();
  if (!abbr) return null;

  // 1) exact abbreviation match (English or local)
  const exact = catalog.find(
    (b) =>
      b.abbreviation?.toLowerCase() === abbr ||
      b.abbreviationLocal?.toLowerCase() === abbr,
  );
  if (exact) return exact.id;

  // 2) name contains the abbreviation as a whole word
  const byName = catalog.find((b) => b.name?.toLowerCase().includes(abbr));
  if (byName) return byName.id;

  // 3) friendly alias for the default target
  if (abbr === "bsb") {
    const berean = catalog.find((b) =>
      b.name?.toLowerCase().includes("berean standard"),
    );
    if (berean) return berean.id;
  }
  return null;
}

export function createApiBibleProvider(): BibleProvider {
  const apiKey = process.env.BIBLE_API_KEY;
  const abbr = process.env.BIBLE_VERSION_ABBR || "BSB";
  const pinnedId = process.env.BIBLE_DEFAULT_VERSION_ID || undefined;

  let resolvedId: string | null = pinnedId ?? null;
  let resolvedLabel = pinnedId ?? abbr;

  async function resolveVersionId(): Promise<string> {
    if (resolvedId) return resolvedId;
    if (!apiKey) {
      throw new BibleProviderError(
        "API.Bible is not configured. Set BIBLE_API_KEY.",
        "not_configured",
      );
    }
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/bibles`, {
        headers: { "api-key": apiKey, Accept: "application/json" },
        next: { revalidate: 60 * 60 * 24 },
      });
    } catch {
      throw new BibleProviderError("Bible provider is unreachable.", "provider_unavailable");
    }
    if (res.status === 401 || res.status === 403) {
      throw new BibleProviderError("API.Bible key was rejected.", "unauthorized");
    }
    if (!res.ok) {
      throw new BibleProviderError(`Provider returned ${res.status}.`, "provider_unavailable");
    }
    const payload = (await res.json()) as { data?: CatalogBible[] };
    const id = selectBibleId(payload.data ?? [], { abbr });
    if (!id) {
      throw new BibleProviderError(
        `No "${abbr}" edition is available to this API.Bible key. Set BIBLE_DEFAULT_VERSION_ID to a licensed/available bible id.`,
        "not_configured",
      );
    }
    resolvedId = id;
    const match = (payload.data ?? []).find((b) => b.id === id);
    resolvedLabel = match?.abbreviation || abbr;
    return id;
  }

  return {
    info(): BibleProviderInfo {
      return {
        id: "apibible",
        versionLabel: resolvedLabel,
        // BSB is freely licensed; other editions depend on the key's rights.
        licensed: Boolean(apiKey),
      };
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

      const versionId = await resolveVersionId();

      // API.Bible chapter id format is "<OSIS>.<chapter>", e.g. "JHN.3".
      const chapterId = `${book.osis}.${chapter}`;
      const url = new URL(`${BASE_URL}/bibles/${versionId}/chapters/${chapterId}`);
      url.searchParams.set("content-type", "json");
      url.searchParams.set("include-verse-numbers", "true");
      url.searchParams.set("include-notes", "false");
      url.searchParams.set("include-titles", "false");

      let res: Response;
      try {
        res = await fetch(url.toString(), {
          headers: { "api-key": apiKey!, Accept: "application/json" },
          next: { revalidate: 60 * 60 },
        });
      } catch {
        throw new BibleProviderError("Bible provider is unreachable.", "provider_unavailable");
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
        throw new BibleProviderError(`Provider returned ${res.status}.`, "provider_unavailable");
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
        versionLabel: resolvedLabel,
        copyright:
          payload.data?.copyright?.trim() ||
          "Provided via API.Bible. Honor the publisher's attribution terms.",
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
      byVerse.set(current, (byVerse.get(current) ?? "") + n.text);
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
