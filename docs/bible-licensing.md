# Bible Licensing

## The NIV is copyrighted

The New International Version (NIV) is copyrighted by Biblica and published by
Zondervan/HarperCollins. It **cannot** be legally copied into this repository,
scraped from BibleGateway or any other site, hard-coded into source, or served
from an unauthorized database. Using the NIV requires a license and adherence
to attribution and usage terms.

**This project never bypasses that.** Instead it uses a provider abstraction so
a properly licensed NIV feed can be plugged in when licensing is in place.

## Provider abstraction

- Interface: `src/lib/bible/types.ts` (`BibleProvider`).
- Factory: `src/lib/bible/service.ts` selects a provider from `BIBLE_PROVIDER`.
- The reader (`src/app/bible/[book]/[chapter]/page.tsx`) depends only on the
  interface, so swapping providers requires **no UI changes**.

## Recommended free alternative to the NIV: the Berean Standard Bible (BSB)

You cannot legally reproduce the NIV's wording, and you must not try to imitate
it. The correct approach is to serve a translation that is **itself freely
licensed** — not a look-alike of the NIV.

The **Berean Standard Bible (BSB)** is the recommended default: a modern,
readable translation in a similar register to the NIV, released for free use
(dedicated to the public / freely licensed by its publisher). Using the BSB is
not "getting around" a license — it is choosing a translation with no license
restriction, so no NIV rights are needed.

The app therefore defaults to **BSB via API.Bible** when an API key is present,
and to the public-domain **WEB** when it is not.

## Providers implemented

### 1. API.Bible — `apibible` (default when `BIBLE_API_KEY` is set)
- Source: `scripture.api.bible` (American Bible Society).
- Default target: **BSB**, resolved from the catalog by abbreviation so you do
  not need to hard-code a version id. Set `BIBLE_VERSION_ABBR="BSB"` (default),
  or pin `BIBLE_DEFAULT_VERSION_ID` to an exact bible id.
- **A key alone does not grant NIV rights.** To serve the NIV, obtain an NIV
  license, enable that edition for your key, and set `BIBLE_DEFAULT_VERSION_ID`
  to the licensed NIV id. BSB needs no such license.
- Env: `BIBLE_API_KEY`, `BIBLE_VERSION_ABBR`, `BIBLE_DEFAULT_VERSION_ID`.

### 2. Public-domain — `public_domain` (automatic fallback)
- Source: **World English Bible (WEB)** via `bible-api.com`.
- License: WEB is **public domain**; free to read, cache, and display.
- Used automatically when no API key is set, or if API.Bible is temporarily
  unavailable/unauthorized. Clearly labeled "WEB", never "NIV".

## Provider selection & fallback

`BIBLE_PROVIDER` (empty = auto): auto uses API.Bible when `BIBLE_API_KEY` is
present, else public domain. The service wraps the primary provider so that
`not_configured`, `unauthorized`, or `provider_unavailable` errors fall back to
WEB. Genuine `not_found` / `invalid_reference` errors are surfaced as 404s.

## To serve the NIV (dependency — requires a licensing decision)

1. Obtain NIV API access/licensing from the rights holder (Biblica) or an
   authorized aggregator that offers the NIV under license.
2. Configure the provider (`BIBLE_PROVIDER=apibible`, set `BIBLE_API_KEY`, and
   `BIBLE_DEFAULT_VERSION_ID` to the licensed NIV edition id).
3. Confirm caching/attribution terms and honor the returned copyright string
   (already surfaced in the reader footer).

Until that license exists, the app serves the freely-licensed **BSB** (via
API.Bible) or the public-domain **WEB** — both legitimate, neither requiring
NIV rights.

## Caching

WEB responses are cached (public domain). For licensed editions, caching is
gated by the provider/publisher terms — verify before enabling long-lived
caches; the API.Bible provider currently uses a short revalidation window.

## Attribution

The reader displays the provider-supplied copyright/attribution string beneath
each chapter. Do not remove it.
