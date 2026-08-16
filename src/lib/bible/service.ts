import "server-only";
import { BibleProvider } from "@/lib/bible/types";
import { createPublicDomainProvider } from "@/lib/bible/providers/public-domain";
import { createApiBibleProvider } from "@/lib/bible/providers/api-bible";

/**
 * BibleService factory — the app's single entry point for scripture text.
 *
 *   Bible Reader  ->  getBibleProvider()  ->  Licensed provider / public-domain
 *
 * The concrete provider is chosen by the BIBLE_PROVIDER env var so the NIV (or
 * any licensed edition) can be swapped in without changing the reader.
 */
let cached: BibleProvider | null = null;

export function getBibleProvider(): BibleProvider {
  if (cached) return cached;
  const which = (process.env.BIBLE_PROVIDER ?? "public_domain").toLowerCase();
  switch (which) {
    case "apibible":
      cached = createApiBibleProvider();
      break;
    case "public_domain":
    case "mock":
    default:
      cached = createPublicDomainProvider();
      break;
  }
  return cached;
}
