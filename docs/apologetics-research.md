# Apologetics Research & Sourcing Standards

## Rules (non-negotiable)

1. **Never fabricate** a resource, URL, book, episode, video, or podcast.
2. Add a resource only after its URL has been **verified to resolve** to the
   intended official content. Mark `verified = true` only then.
3. Prefer **official sources** (a ministry's own site/channel). Mark `official`.
4. **Quality over quantity.** Do not pad categories to hit a quota.
5. Represent opposing views **fairly** — steelman, never strawman.
6. Do not overstate manuscript counts or scholarly consensus.
7. Do not copy full articles, book text, transcripts, or videos — link out.

## Verified sources (provided and treated as verified)

These official URLs were explicitly provided and are seeded in
`supabase/migrations/0005_seed_apologetics.sql` and mirrored in
`src/lib/apologetics/sources.ts`:

| Source | Website | Spotify | YouTube |
|---|---|---|---|
| Cold-Case Christianity | https://coldcasechristianity.com/ | https://open.spotify.com/show/7aSbO4B9TAnP4unGDhpKhL | https://m.youtube.com/@ColdCaseChristianity |
| Cross Examined | https://crossexamined.org/ | https://open.spotify.com/show/33MgzSFOheNQ8BnxMGbDOv | https://m.youtube.com/@CrossExamined |
| John Lennox | https://johnlennox.org/ | — (verify before adding) | — (verify before adding) |

Only the URLs above are included. For John Lennox, specific videos, a Spotify
show, YouTube channel, books, and OCCA resources must be **individually
verified** before they are added — none are invented here.

## Adding new resources (procedure)

1. Identify the official owner of the resource.
2. Open the URL and confirm it resolves to the intended content.
3. Insert into `apologetics_resources` with the correct `resource_type`,
   `source_id`, `verified = true`, and `official` as appropriate.
4. Link it to one or more topics via `resource_topics`.
5. Add a corresponding entry to a periodic **broken-link audit**.

## Backlog (to research and verify, not yet added)

- John Lennox: official YouTube channel, verified talk/debate videos, book
  list with official purchase links, OCCA resources.
- Topic-level articles/episodes/videos for each of the 16 evidence categories.
- Debate resources for the resurrection objections (hallucination, stolen body,
  swoon, legend), presenting each objection fairly with primary-source links.
