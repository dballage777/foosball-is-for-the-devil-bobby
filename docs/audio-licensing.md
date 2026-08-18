# Audio Licensing & Embedding

## Principle

Chapter-specific background audio (e.g. **The Listener's Commentary** by John
Piippo / the requested source) is **linked or officially embedded — never
re-hosted**. We do not download and serve copyrighted audio unless hosting is
explicitly authorized in writing by the rights holder.

## Data model

`audio_resources` (see `supabase/migrations/0003_join_and_audio.sql`):

| column | purpose |
|---|---|
| `book_slug`, `chapter` | which chapter the resource maps to |
| `title`, `description` | display metadata |
| `provider` | e.g. "Listener's Commentary" |
| `page_url` | official page — **always safe to link** |
| `embed_url` | official embed URL — populated **only** if the provider's terms permit embedding |
| `audio_url` | direct audio — populated **only** if we are authorized to host/stream |

The reader (`src/components/audio-panel.tsx`) prefers `embed_url` (official
embed) and otherwise shows a link to `page_url` ("Listen at …"). It never
fabricates a player.

## How to add mappings (dependency — verify embedding terms)

1. Confirm the official page URL for the chapter's resource.
2. Check the provider's terms of use / embedding policy.
   - If official embeds are offered and permitted → set `embed_url`.
   - If not → leave `embed_url` null; the official link is shown instead.
3. Only set `audio_url` if you have explicit authorization to host the file.
4. Insert rows via trusted server tooling / SQL (the table is read-only to app
   users through RLS).

## What the reader shows today

Every chapter shows a **Chapter Audio** panel for *The Listener's Commentary*
(John Whittaker):

1. Any **verified chapter/range-specific** mappings from `audio_resources`
   (official embed when terms allow, otherwise an official link).
2. An always-available, **book-aware "Browse {Book} episodes"** link to the
   official site, plus an Apple Podcasts link. Because episodes cover chapter
   *ranges* (e.g. "Leviticus 1–3"), this book-level link is the reliable way to
   reach the right episode until exact per-chapter mappings are entered.

The book-browse base URL is `NEXT_PUBLIC_LC_SEARCH_BASE`
(default `https://listenerscommentary.com/?s=`), overridable if the site's
search URL changes.

## Adding exact chapter/range mappings (verified only)

When you have confirmed an episode's official page (and, if permitted, its embed
URL), insert one row per chapter it covers. Example for an episode covering
Leviticus 1–3:

```sql
insert into audio_resources (book_slug, chapter, title, provider, page_url, embed_url, description)
values
  ('leviticus', 1, 'Leviticus 1–3', 'The Listener''s Commentary',
   'https://listenerscommentary.com/<verified-episode-slug>/', null, 'Verse-by-verse teaching'),
  ('leviticus', 2, 'Leviticus 1–3', 'The Listener''s Commentary',
   'https://listenerscommentary.com/<verified-episode-slug>/', null, null),
  ('leviticus', 3, 'Leviticus 1–3', 'The Listener''s Commentary',
   'https://listenerscommentary.com/<verified-episode-slug>/', null, null);
```

Only set `embed_url` if the platform (e.g. Podbean/Apple) offers an official
embed and its terms permit embedding. Never set `audio_url` (that would imply
re-hosting) unless you have explicit written authorization. Confirm each
`page_url` resolves before inserting — do not add unverified URLs.
