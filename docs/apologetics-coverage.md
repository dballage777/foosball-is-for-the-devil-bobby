# Apologetics Coverage

Tracks which topics have explanatory prose and verified resources.
Taxonomy lives in `src/lib/apologetics/content.ts` (UI) and
`supabase/migrations/0005_seed_apologetics.sql` (DB). Slugs are kept in sync.

Legend: ✅ done · ◻️ summary only (needs deeper article/resources)

Every topic now has original explanatory **body prose** (multi-paragraph),
verified by a unit test. Resurrection objections and Common Objections use a
fair "objection → strongest form → response" structure. Verified external
resources per topic are still being added under the research procedure.

## Categories (16)

| # | Category | Body prose | Topics | Verified resources |
|---|---|---|---|---|
| 1 | Does God Exist? | ✅ | 4 | ◻️ |
| 2 | Origin of the Universe | ✅ | 2 | ◻️ |
| 3 | Fine-Tuning | ✅ | 2 | ◻️ |
| 4 | Origin of Life & Biological Information | ✅ | 2 | ◻️ |
| 5 | Objective Morality | ✅ | 2 | ◻️ |
| 6 | Consciousness, Reason & Free Will | ✅ | 2 | ◻️ |
| 7 | Biblical Reliability | ✅ | 1 | ◻️ |
| 8 | New Testament Reliability | ✅ | 2 | ◻️ |
| 9 | Archaeology & Historical Corroboration | ✅ | 1 | ◻️ |
| 10 | Historical Jesus | ✅ | 2 | ◻️ |
| 11 | Resurrection of Jesus | ✅ | 7 (incl. 4 objections) | ◻️ |
| 12 | Christianity & Science | ✅ | 1 | ◻️ |
| 13 | Miracles | ✅ | 1 | ◻️ |
| 14 | Evil & Suffering | ✅ | 2 | ◻️ |
| 15 | Worldviews | ✅ + comparison table | 1 | ◻️ |
| 16 | Common Objections | ✅ | 3 | ◻️ |

## Featured pathway — "The Case for Christianity"

14-step guided pathway implemented in `CASE_PATHWAY` and rendered on
`/apologetics`. Each step links to a category/topic anchor.

## Resource library

- 7 verified official source entries seeded (see `apologetics-research.md`).
- Deeper per-topic resources are added only after URL verification.

## Bible ↔ Apologetics links (curated, non-arbitrary)

Seeded in `bible_apologetics_links`:
`1 Peter 3`, `John 20`, `1 Corinthians 15`, `Romans 1`, `Genesis 1`, `Psalm 19`.

## Next steps
- Expand explanatory articles per topic (original prose).
- Add verified resources per category following the research procedure.
- Add worldview comparison table data.
