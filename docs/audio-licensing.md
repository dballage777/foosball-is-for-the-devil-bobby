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

## Status

No audio mappings are seeded yet, because each mapping requires confirming the
correct official URL and the provider's embedding terms. The architecture,
table, and UI are complete and ready to receive verified mappings.
