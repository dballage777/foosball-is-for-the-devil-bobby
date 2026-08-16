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

## Providers implemented

### 1. Public-domain (default) — `public_domain`
- Source: **World English Bible (WEB)** via `bible-api.com`.
- License: WEB is **public domain**; free to read, cache, and display.
- This is a real, legitimate scripture source used for development and for
  users without an NIV license. It is clearly labeled "WEB", not "NIV".

### 2. API.Bible — `apibible`
- Source: `scripture.api.bible` (American Bible Society).
- Provides many versions via one API. **An API key alone does not grant NIV
  rights** — a licensed edition id must be enabled for your key by the rights
  holder, with its own attribution string returned per chapter.
- Env: `BIBLE_API_KEY`, `BIBLE_DEFAULT_VERSION_ID`.

## To serve the NIV (dependency — requires a licensing decision)

1. Obtain NIV API access/licensing from the rights holder (Biblica) or an
   authorized aggregator that offers the NIV under license.
2. Configure the provider (`BIBLE_PROVIDER=apibible`, set `BIBLE_API_KEY`, and
   `BIBLE_DEFAULT_VERSION_ID` to the licensed NIV edition id).
3. Confirm caching/attribution terms and honor the returned copyright string
   (already surfaced in the reader footer).

Until that license exists, the app serves the public-domain WEB translation.

## Caching

WEB responses are cached (public domain). For licensed editions, caching is
gated by the provider/publisher terms — verify before enabling long-lived
caches; the API.Bible provider currently uses a short revalidation window.

## Attribution

The reader displays the provider-supplied copyright/attribution string beneath
each chapter. Do not remove it.
