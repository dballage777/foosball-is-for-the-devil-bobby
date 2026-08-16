# Berean — Bible Study & Apologetics Platform

A production-quality Christian web application combining **Bible reading**,
**personal study** (highlights, notes, bookmarks), **collaborative virtual
Bible studies**, and a **Christian apologetics** section with a searchable
resource library.

> The rhythm: **Read → Study → Discuss → Apply → Explore.**
> The Bible reader is the center; studies surround it; apologetics is a
> research layer.

## Stack
- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** (theme-aware, mobile-first)
- **Supabase** — Postgres + Auth + Row Level Security
- Bible text via a **provider abstraction** (public-domain WEB by default;
  licensed editions such as the NIV plug in without UI changes)

## Quick start
```bash
npm install
cp .env.example .env.local        # fill in real values; never commit secrets
# apply supabase/migrations/*.sql to your Supabase project (in order)
npm run dev
```
The app runs against the **public-domain World English Bible** with no keys.
Configure Supabase to enable accounts, personal study, and collaborative studies.

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint (`next lint`) |
| `npm test` | Vitest unit tests |

## Documentation
See [`docs/`](./docs): architecture, database, security, deployment,
Bible/audio licensing, apologetics research & coverage, and live
[development progress](./docs/development-progress.md). Contributor guidance is
in [`CLAUDE.md`](./CLAUDE.md).

## Licensing & content integrity
- The **NIV is copyrighted** — it is never scraped, copied, or hard-coded;
  it is served only through a licensed provider. See
  [`docs/bible-licensing.md`](./docs/bible-licensing.md).
- Chapter audio is **linked/embedded from official sources, never re-hosted**.
- Apologetics resources link to their official owners; **no resource URL is
  fabricated** — see [`docs/apologetics-research.md`](./docs/apologetics-research.md).

## Legacy code
The repository previously held an unrelated **NFL prediction engine** (Python).
It is preserved untouched under
[`legacy/nfl-prediction-engine/`](./legacy/nfl-prediction-engine/) and is not
part of the web build.
