import { NextResponse } from "next/server";
import { getBibleProvider } from "@/lib/bible/service";
import { BibleProviderError } from "@/lib/bible/types";

// Always run fresh — this is a live check against the configured provider.
export const dynamic = "force-dynamic";

/**
 * GET /api/bible/health
 *
 * Confirms which translation the configured provider actually resolves, by
 * fetching a single well-known verse (John 1:1). Never exposes the API key.
 * Useful right after setting BIBLE_API_KEY to verify BSB resolves.
 */
export async function GET() {
  const provider = getBibleProvider();
  const info = provider.info();
  try {
    const chapter = await provider.getChapter("john", 1);
    const first = chapter.verses[0];
    return NextResponse.json({
      ok: true,
      configuredProvider: info.id,
      versionLabel: chapter.versionLabel,
      copyright: chapter.copyright,
      sample: first ? `John 1:${first.number}: ${first.text}` : null,
    });
  } catch (err) {
    const code = err instanceof BibleProviderError ? err.code : "unknown";
    return NextResponse.json(
      {
        ok: false,
        configuredProvider: info.id,
        error: code,
        hint:
          code === "unauthorized"
            ? "API.Bible rejected the key, or the key lacks access to this edition."
            : code === "not_configured"
              ? "BSB was not found for this key; the reader falls back to public-domain WEB."
              : "Provider unavailable; the reader falls back to public-domain WEB.",
      },
      { status: 200 },
    );
  }
}
