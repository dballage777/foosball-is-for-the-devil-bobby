// Provider-agnostic types for the Bible reading service.
// The reader UI depends ONLY on these types, never on a concrete provider,
// so a licensed NIV provider can be swapped in without touching the UI.

export interface Verse {
  number: number;
  /** Plain text of the verse. Never persisted/cached beyond provider terms. */
  text: string;
}

export interface Chapter {
  bookSlug: string;
  bookName: string;
  chapter: number;
  /** Human copyright/attribution string required by the provider/publisher. */
  copyright: string;
  /** Version identifier actually served (e.g. "NIV", "WEB"). */
  versionLabel: string;
  verses: Verse[];
}

export interface BibleProviderInfo {
  id: string;
  versionLabel: string;
  /** Whether this provider is serving fully-licensed text (vs. dev sample). */
  licensed: boolean;
}

/**
 * The single seam between the app and any Bible text source.
 *
 * Implementations MUST respect the licensing terms of their source. In
 * particular the NIV is copyrighted (see docs/bible-licensing.md); a provider
 * may only return NIV text if configured with valid licensed credentials.
 */
export interface BibleProvider {
  info(): BibleProviderInfo;
  getChapter(bookSlug: string, chapter: number): Promise<Chapter>;
}

export class BibleProviderError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_configured"
      | "not_found"
      | "unauthorized"
      | "provider_unavailable"
      | "invalid_reference",
  ) {
    super(message);
    this.name = "BibleProviderError";
  }
}
