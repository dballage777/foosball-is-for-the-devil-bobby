# CLAUDE.md — Bible Study & Apologetics Platform

Guidance for AI/engineers working in this repository.

## Purpose
A production-quality Christian platform combining Bible reading, personal study
(highlights/notes/bookmarks), collaborative virtual Bible studies, and a
Christian apologetics education section with a searchable resource library.
The intended rhythm: **Read → Study → Discuss → Apply → Explore**. The Bible
reader is the center; studies surround it; apologetics is a research layer.

## Architecture (summary — see `docs/architecture.md`)
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript (strict).
- **Styling:** Tailwind CSS with semantic CSS-variable theme tokens (light/dark).
- **Data/Auth:** Supabase (Postgres + Auth + Row Level Security).
- **Bible text:** provider abstraction (`src/lib/bible/`) — never hard-coded.
- **Legacy:** the prior NFL prediction engine (Python) is preserved untouched
  under `legacy/nfl-prediction-engine/` and is not part of the web build.

## Coding standards
- TypeScript strict; no `any` unless justified and localized.
- Server Components by default; Client Components only when interactivity needs it.
- Data access goes through `src/lib/*`; pages stay thin.
- Keep the reader dependent only on `BibleProvider` types, never a concrete provider.
- Match existing file style; comment the *why*, not the obvious.
- Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` before commits.

## Database rules
- All new tables enable RLS. Personal data is owner-only; shared data is
  gated by study membership via `SECURITY DEFINER` helper functions
  (`is_study_member`, `can_manage_study`).
- Never expose internal IDs as capabilities — invites use opaque tokens.
- Migrations are additive and idempotent (`create ... if not exists`, guarded enums).

## Authentication rules
- Supabase Auth. Server code validates the user with `auth.getUser()` (not just
  the session). The anon key is the only key sent to the browser.
- The service-role key is server-only and must never be imported into client code.

## Bible licensing rules (see `docs/bible-licensing.md`)
- The **NIV is copyrighted**. Do NOT scrape BibleGateway, copy the NIV into the
  repo, hard-code it, or bypass licensing.
- NIV (or any licensed edition) is served only through a configured, licensed
  provider. The default provider serves the public-domain WEB translation.

## Audio licensing rules (see `docs/audio-licensing.md`)
- Chapter audio (e.g. Listener's Commentary) is **linked or officially embedded**,
  never re-hosted. `audio_url` stays null unless hosting is explicitly authorized.

## Apologetics source rules (see `docs/apologetics-research.md`)
- Never fabricate resources or URLs. Only add a resource after its URL is
  verified to resolve. Prefer official sources. Quality over quotas.
- Represent other views fairly; do not overstate manuscript statistics or
  scholarly consensus.

## Privacy & security requirements (see `docs/security.md`)
- Private notes and private studies must remain private, enforced at the DB.
- Never trust client-side permissions. Validate inputs (zod) in server actions.
- Never commit secrets; `.env.example` holds placeholders only.

## Testing requirements
- Vitest for unit tests (`*.test.ts`). Cover Bible navigation logic, provider
  parsing, and (as they land) authorization behaviors.

## Deployment requirements (see `docs/deployment.md`)
- Configure Supabase + run migrations in `supabase/migrations/` in order.
- Set env vars from `.env.example`. Choose a Bible provider.

## Current development phase
**Foundation complete** (Phases 0–7 substantially; 8–15 scaffolded). See
`docs/development-progress.md` for the live status and known issues.

## Completed features
- Repo audit, architecture, and full docs set.
- Next.js + Tailwind + Supabase scaffold; middleware session refresh.
- Full Postgres schema + RLS for all domains (personal, studies, apologetics, audio).
- Bible provider abstraction (public-domain WEB + API.Bible) and working reader
  with book/chapter navigation, prev/next, SEO metadata.
- Auth (sign up / in / out), My Study (read), collaborative studies (create,
  invite, join via token, discussion, applications, leave).
- Apologetics section (16 categories, topics, Case-for-Christianity pathway) and
  resource library with verified official sources.

## Known issues / not yet done
- Verse-level interactive highlight/note UI (write path) is scaffolded in the DB
  but the in-reader controls are not yet wired.
- Apologetics resource library needs deeper verified content (research doc).
- No E2E tests yet; RLS has unit-level reasoning but not automated integration tests.
- NIV requires a real license before it can be served.
