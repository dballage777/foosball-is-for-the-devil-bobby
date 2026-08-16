# Architecture

## Repository audit (Phase 0)

At the start of this project the repository contained a **completely unrelated
project**: an NFL prediction / betting-backtest engine written in Python
(`pandas`, `scikit-learn`, `xgboost`, `pytest`). There was **no existing web
application, database, authentication, or UI system** to reuse.

Per an explicit decision, that Python project was preserved verbatim under
`legacy/nfl-prediction-engine/` (moved with `git mv`, so history is intact) and
is excluded from the web build (`tsconfig` `exclude`, ESLint `ignorePatterns`,
scoped `.gitignore`). It is not deleted.

**Conclusion:** the Bible study platform is a greenfield web application built
alongside the preserved legacy code.

## Chosen architecture (Phase 1)

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR for SEO on public pages, Server Components + Server Actions for secure data access, file-based routing. |
| Language | **TypeScript (strict)** | Type safety across UI and data layer. |
| UI | **Tailwind CSS** + semantic CSS-variable tokens | Fast, consistent, theme-aware (light/dark), responsive/mobile-first. |
| Auth + DB | **Supabase (Postgres + Auth + RLS)** | Row Level Security enforces per-user privacy at the database — the strongest place for it. Matches the prompt's suggested stack. |
| Bible text | **Provider abstraction** | The NIV is copyrighted; the reader must not depend on any single source. |
| Tests | **Vitest** | Fast unit tests for pure logic. |

### Layering

```
                 ┌─────────────────────────────────────────┐
   Browser  ───► │  Next.js App Router (Server Components)  │
                 │  src/app/**  +  Server Actions           │
                 └───────────────┬─────────────────────────┘
                                 │
          ┌──────────────────────┼───────────────────────────┐
          ▼                      ▼                            ▼
   src/lib/bible/         src/lib/supabase/            src/lib/data/
   BibleService  ───►     server/browser clients ───►  query helpers
   (provider seam)        (anon key, RLS-bound)        (audio, apologetics)
          │
          ▼
   Public-domain (WEB)  |  API.Bible (licensed NIV/etc.)
```

### Key directories

- `src/app/**` — routes (Home, Bible, My Study, Bible Studies, Apologetics,
  Resources, About, Account) plus `robots.ts`/`sitemap.ts`.
- `src/lib/bible/` — canon metadata, provider types, providers, `service.ts`.
- `src/lib/supabase/` — `server.ts`, `client.ts`, `middleware.ts`.
- `src/lib/apologetics/` — static taxonomy + verified sources.
- `src/lib/data/` — server-only DB query helpers used by pages.
- `src/components/` — shared UI (nav, reader controls, auth form, gates).
- `supabase/migrations/` — ordered SQL: schema + RLS + seed.

### Security posture

Authorization is enforced primarily by **Postgres Row Level Security**, so a
compromised or buggy client cannot read another user's private notes or a
private study. Server Actions add input validation (zod) and use the
RLS-bound anon client (never the service-role key). See `docs/security.md`.

### Error handling

The reader catches `BibleProviderError` and renders an honest "temporarily
unavailable / not configured" state rather than a raw error. DB query helpers
degrade to empty results when Supabase is not configured, so public pages
render without a backend during early setup.
