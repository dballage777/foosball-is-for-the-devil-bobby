import { NextRequest, NextResponse } from "next/server";
import { getBibleProvider } from "@/lib/bible/service";
import { BibleProviderError } from "@/lib/bible/types";
import { API_BIBLE_BASE } from "@/lib/bible/providers/api-bible";

// Always run fresh — this is a live check against the configured provider.
export const dynamic = "force-dynamic";

const API_BASE = API_BIBLE_BASE;

/**
 * GET /api/bible/health
 *   -> checks the CONFIGURED provider (fetches John 1:1) and reports which
 *      translation actually resolved.
 *
 * GET /api/bible/health?id=<apiBibleId>
 *   -> identifies a specific API.Bible edition (name, abbreviation, copyright)
 *      so you can tell which of several ids is the BSB. Requires BIBLE_API_KEY.
 *
 * Never exposes the API key.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) return identifyEdition(id);

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
    return NextResponse.json({
      ok: false,
      configuredProvider: info.id,
      error: code,
      hint:
        code === "unauthorized"
          ? "API.Bible rejected the key, or the key lacks access to this edition."
          : code === "not_configured"
            ? "BSB was not found for this key; the reader falls back to public-domain WEB."
            : "Provider unavailable; the reader falls back to public-domain WEB.",
    });
  }
}

/** Look up one API.Bible edition's metadata to identify what it is. */
async function identifyEdition(id: string) {
  const key = process.env.BIBLE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "not_configured", hint: "Set BIBLE_API_KEY to identify an edition id." },
      { status: 200 },
    );
  }
  try {
    const res = await fetch(`${API_BASE}/bibles/${encodeURIComponent(id)}`, {
      headers: { "api-key": key, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        id,
        error: res.status === 401 || res.status === 403 ? "unauthorized" : `http_${res.status}`,
        hint:
          res.status === 404
            ? "No edition with this id is available to your key."
            : "Could not fetch this edition's metadata.",
      });
    }
    const data = (await res.json()) as {
      data?: { id: string; name?: string; abbreviation?: string; abbreviationLocal?: string; copyright?: string };
    };
    const b = data.data;

    // Also test CHAPTER TEXT access (metadata access does not guarantee text
    // access on some licensed editions/plans). Fetch John 1 for this id.
    const chapterProbe = await probeChapterAccess(id, key);

    return NextResponse.json({
      ok: true,
      id: b?.id ?? id,
      name: b?.name ?? null,
      abbreviation: b?.abbreviation ?? b?.abbreviationLocal ?? null,
      copyright: b?.copyright ?? null,
      isBerean: /berean/i.test(b?.name ?? "") || /bsb/i.test(b?.abbreviation ?? ""),
      chapterTextAccess: chapterProbe,
      pinHint: `To use this edition, set BIBLE_DEFAULT_VERSION_ID="${b?.id ?? id}"`,
    });
  } catch {
    return NextResponse.json({ ok: false, id, error: "provider_unavailable" });
  }
}

/**
 * Probe whether the key can actually retrieve CHAPTER TEXT for an edition
 * (John 1). Some licensed editions/plans expose metadata but restrict text.
 */
async function probeChapterAccess(id: string, key: string) {
  try {
    const url = new URL(`${API_BASE}/bibles/${encodeURIComponent(id)}/chapters/JHN.1`);
    url.searchParams.set("content-type", "json");
    url.searchParams.set("include-verse-numbers", "true");
    const res = await fetch(url.toString(), {
      headers: { "api-key": key, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        reason:
          res.status === 401 || res.status === 403
            ? "Key can read this edition's metadata but is not authorized for its chapter TEXT (may require a different plan/approval)."
            : `Chapter request returned ${res.status}.`,
      };
    }
    const body = (await res.json()) as { data?: { content?: unknown } };
    const hasContent = Boolean(
      body.data?.content &&
        (Array.isArray(body.data.content)
          ? body.data.content.length > 0
          : true),
    );
    return { ok: hasContent, status: 200 };
  } catch {
    return { ok: false, status: 0, reason: "Chapter request failed to connect." };
  }
}
