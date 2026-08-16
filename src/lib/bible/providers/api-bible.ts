import { getBook, isValidReference } from "@/lib/bible/books";
import {
  BibleProvider,
  BibleProviderError,
  BibleProviderInfo,
  Chapter,
} from "@/lib/bible/types";

/**
 * API.Bible provider (scripture.api.bible / rest.api.bible, American Bible
 * Society — an OFFICIAL, licensed Scripture distributor).
 *
 * The edition served depends on what your API key is licensed for. If your
 * key/application is authorized for the NIV, serving it here (with the
 * publisher's copyright notice displayed) is the sanctioned, licensed path —
 * not a workaround. Otherwise use a freely-licensed edition such as the BSB.
 * See docs/bible-licensing.md.
 *
 * Configure via env:
 *   BIBLE_API_KEY             (required)
 *   BIBLE_DEFAULT_VERSION_ID  (pin an exact bible id, e.g. your NIV id)
 *   BIBLE_VERSION_ABBR        (abbreviation to auto-resolve if no id, default "BSB")
 *   BIBLE_API_BASE            (optional: override the API base URL)
 *
 * Both "https://rest.api.bible/v1" (shown on newer dashboards) and
 * "https://api.scripture.api.bible/v1" are valid and interchangeable.
 */
export const API_BIBLE_BASE =
  process.env.BIBLE_API_BASE || "https://rest.api.bible/v1";
const BASE_URL = API_BIBLE_BASE;

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
    return target.id; // trust an explicit id even if not in the catalog
  }
  const abbr = (target.abbr ?? "").trim().toLowerCase();
  if (!abbr) return null;

  const exact = catalog.find(
    (b) =>
      b.abbreviation?.toLowerCase() === abbr ||
      b.abbreviationLocal?.toLowerCase() === abbr,
  );
  if (exact) return exact.id;

  const byName = catalog.find((b) => b.name?.toLowerCase().includes(abbr));
  if (byName) return byName.id;

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

  let resolvedId: string | null = null;
  let resolvedLabel = pinnedId ? abbr : abbr;
  let resolved = false;

  async function fetchJson<T>(path: string): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        headers: { "api-key": apiKey!, Accept: "application/json" },
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
    return (await res.json()) as T;
  }

  /** Ensure we know both the bible id to fetch and a human-friendly label. */
  async function ensureResolved(): Promise<string> {
    if (resolved && resolvedId) return resolvedId;
    if (!apiKey) {
      throw new BibleProviderError(
        "API.Bible is not configured. Set BIBLE_API_KEY.",
        "not_configured",
      );
    }

    if (pinnedId) {
      resolvedId = pinnedId;
      // Best-effort: fetch metadata so the reader shows e.g. "NIV11" not the id.
      try {
        const meta = await fetchJson<{ data?: CatalogBible }>(
          `/bibles/${encodeURIComponent(pinnedId)}`,
        );
        resolvedLabel =
          meta.data?.abbreviation || meta.data?.abbreviationLocal || abbr;
      } catch {
        resolvedLabel = abbr; // still serve the edition; just a plainer label
      }
      resolved = true;
      return resolvedId;
    }

    // No pinned id: resolve by abbreviation from the catalog.
    const catalog = await fetchJson<{ data?: CatalogBible[] }>("/bibles");
    const id = selectBibleId(catalog.data ?? [], { abbr });
    if (!id) {
      throw new BibleProviderError(
        `No "${abbr}" edition is available to this API.Bible key. Set BIBLE_DEFAULT_VERSION_ID to an available bible id.`,
        "not_configured",
      );
    }
    resolvedId = id;
    const match = (catalog.data ?? []).find((b) => b.id === id);
    resolvedLabel = match?.abbreviation || abbr;
    resolved = true;
    return id;
  }

  return {
    info(): BibleProviderInfo {
      return {
        id: "apibible",
        versionLabel: resolvedLabel,
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

      const versionId = await ensureResolved();

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
