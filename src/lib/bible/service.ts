import "server-only";
import { BibleProvider, BibleProviderError, Chapter } from "@/lib/bible/types";
import { createPublicDomainProvider } from "@/lib/bible/providers/public-domain";
import { createApiBibleProvider } from "@/lib/bible/providers/api-bible";

/**
 * BibleService factory — the app's single entry point for scripture text.
 *
 *   Bible Reader  ->  getBibleProvider()  ->  Licensed/free provider
 *
 * Default translation: **Berean Standard Bible (BSB)** via API.Bible when a key
 * is configured (a freely-licensed, NIV-style modern translation). If no key is
 * set — or the licensed provider is temporarily unavailable — the reader falls
 * back to the public-domain World English Bible (WEB) so scripture always
 * loads. The NIV requires its own license (see docs/bible-licensing.md).
 */
let cached: BibleProvider | null = null;

function chooseProvider(): BibleProvider {
  const explicit = process.env.BIBLE_PROVIDER?.toLowerCase();
  const hasApiKey = Boolean(process.env.BIBLE_API_KEY);

  // Explicit override wins.
  if (explicit === "public_domain" || explicit === "mock") {
    return createPublicDomainProvider();
  }
  if (explicit === "apibible") {
    return withFallback(createApiBibleProvider());
  }
  // Auto: prefer the configured (BSB/licensed) provider, else public domain.
  return hasApiKey
    ? withFallback(createApiBibleProvider())
    : createPublicDomainProvider();
}

/**
 * Wraps a primary provider so that configuration/availability failures fall
 * back to the public-domain WEB provider. Genuine reference errors
 * (not_found / invalid_reference) are NOT swallowed — those are real 404s.
 */
function withFallback(primary: BibleProvider): BibleProvider {
  const backup = createPublicDomainProvider();
  return {
    info() {
      return primary.info();
    },
    async getChapter(bookSlug: string, chapter: number): Promise<Chapter> {
      try {
        return await primary.getChapter(bookSlug, chapter);
      } catch (err) {
        const code = err instanceof BibleProviderError ? err.code : null;
        if (code === "not_found" || code === "invalid_reference") throw err;
        // not_configured | unauthorized | provider_unavailable -> use WEB.
        return backup.getChapter(bookSlug, chapter);
      }
    },
  };
}

export function getBibleProvider(): BibleProvider {
  if (!cached) cached = chooseProvider();
  return cached;
}
