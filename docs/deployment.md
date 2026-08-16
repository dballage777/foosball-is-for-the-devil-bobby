# Deployment

## Prerequisites
- Node.js ≥ 18.18
- A Supabase project (Postgres + Auth)
- A Bible provider choice (public-domain by default; licensed NIV optional)

## 1. Install & configure
```bash
npm install
cp .env.example .env.local   # fill in real values (never commit .env.local)
```

Set at minimum:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (used for invite links, sitemap, canonical URLs)
- `BIBLE_PROVIDER` (`public_domain` or `apibible`); if `apibible`, set
  `BIBLE_API_KEY` and `BIBLE_DEFAULT_VERSION_ID`.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only (admin scripts / migrations).

## 2. Apply database migrations
Run the SQL files in `supabase/migrations/` **in order** against your project
(via the Supabase SQL editor, `psql`, or the Supabase CLI). They are idempotent.

```bash
# Example with the Supabase CLI (if linked):
supabase db push
# or run each file 0001..0005 manually in the SQL editor.
```

## 3. Auth settings (Supabase dashboard)
- Enable Email/password sign-in.
- Decide on email confirmation (the sign-up UI handles both cases).
- Set the Site URL and redirect URLs to match `NEXT_PUBLIC_SITE_URL`.

## 4. Build & run
```bash
npm run typecheck && npm run lint && npm test && npm run build
npm start
```

## 5. Hosting
- Any Node host supporting Next.js 14 (e.g. Vercel, or a Node server).
- Provide all env vars in the host's environment settings.
- Ensure the middleware runs (session refresh) — default matcher excludes
  static assets.

## Verifications before go-live
See `docs/final-audit.md` (to be produced in Phase 20): full test suite,
production build, typecheck, lint, migration check, authorization audit,
broken-link audit, mobile/desktop/accessibility/SEO/performance audits.
