# Development Progress

Live status of the phased build. Updated as work lands.

## Phase status

| Phase | Description | Status |
|---|---|---|
| 0 | Repository audit | ✅ Complete (`docs/architecture.md`) |
| 1 | Architecture & technical plan | ✅ Complete |
| 2 | Documentation / CLAUDE.md | ✅ Complete |
| 3 | Dev environment (Next.js/TS/Tailwind, scripts) | ✅ Complete |
| 4 | Database architecture (schema + RLS) | ✅ Complete (migrations 0001–0005) |
| 5 | Authentication & accounts | ✅ Sign up/in/out, profile; recovery flows TODO |
| 6 | Bible provider abstraction | ✅ Public-domain + API.Bible providers |
| 7 | Bible reader | ✅ Book/chapter nav, prev/next, reader, SEO |
| 8 | Chapter audio integration | ◻️ Architecture + UI done; verified mappings pending |
| 9 | Personal highlights & notes | ◻️ DB + read views done; in-reader write UI pending |
| 10 | Bible study groups | ✅ Create/join/leave, members, invite tokens |
| 11 | Group sharing/discussion/application | ✅ Discussion, "stood out", applications; share-from-reader pending |
| 12 | Apologetics architecture | ✅ Taxonomy, pages, pathway |
| 13 | Apologetics research/import | ◻️ Verified sources seeded; deeper resources ongoing |
| 14 | Apologetics UI/search/filtering | ✅ Library page with filters (DB + fallback) |
| 15 | Bible ↔ Apologetics integration | ✅ Links seeded + surfaced in reader/studies |
| 16 | Testing / security | ◻️ Unit tests + RLS design; integration/E2E pending |
| 17 | Mobile/Chromebook optimization | ◻️ Responsive layout in place; device QA pending |
| 18 | SEO/accessibility/performance | ◻️ Metadata, robots, sitemap, skip-link, focus states in place |
| 19 | Deployment preparation | ✅ `docs/deployment.md`, `.env.example` |
| 20 | Final audit | ◻️ Pending (`docs/final-audit.md`) |

## Verified green (this build)
- `npm run typecheck` — passes
- `npm run lint` — clean
- `npm test` — 8/8 passing (Bible navigation logic)
- `npm run build` — succeeds, 31 routes

## Known issues / next up
1. Wire verse-level highlight/note **write** controls into the reader
   (client component + server actions; DB + RLS already support it).
2. Add "Share with study" from the reader (writes `shared_annotations`).
3. Reading-history recording on chapter view.
4. Expand apologetics resources (verified) and worldview comparison data.
5. Password reset / email verification UX.
6. Automated RLS integration tests and E2E happy-path.
7. Device/accessibility QA passes (Phases 17–18) and final audit (Phase 20).

## Not doing (by policy / dependency)
- Serving the NIV until a real license is configured (see `bible-licensing.md`).
- Hosting copyrighted audio (link/embed only — see `audio-licensing.md`).
- Adding any unverified/fabricated resource URLs.
