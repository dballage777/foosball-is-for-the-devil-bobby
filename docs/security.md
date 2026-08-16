# Security

## Principles
- **Never trust the client.** Authorization is enforced in Postgres via RLS.
- Server code validates the user with `supabase.auth.getUser()` (verifies the
  JWT), not just a decoded session.
- Only the **anon** key reaches the browser. The **service-role** key is
  server-only and must never be imported into client components or committed.

## Authorization
- Every app-facing table has RLS enabled (see `docs/database.md`).
- Private notes / private studies are unreadable to non-owners/non-members at
  the database level — a client bug cannot leak them.
- Study joining goes through a `SECURITY DEFINER` RPC that validates opaque
  invite tokens; there is no blanket self-insert policy on members.

## Input validation
- Server Actions validate all input with **zod** before writing
  (`src/app/studies/actions.ts`). Book slugs are validated against the canon.

## Injection & XSS
- All DB access uses the Supabase client (parameterized) — no string-built SQL
  in app code.
- React escapes rendered content by default; we do not use
  `dangerouslySetInnerHTML`. Scripture text is rendered as plain text.

## Secrets
- `.env.local` is gitignored. `.env.example` contains placeholders only.
- No secrets appear in source, comments, or committed migrations.

## Transport & headers
- Security headers set in `next.config.mjs` (`X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`).
- External links use `rel="noopener noreferrer"`.

## Privacy / indexing
- `robots.ts` disallows `/account`, `/my-study`, `/studies`.
- Private/personal pages set `robots: { index: false }` in metadata.

## Outstanding hardening (tracked)
- Rate limiting on auth and write endpoints (add at the edge / gateway).
- Automated RLS integration tests (simulate two users; assert isolation).
- CSRF: Next.js Server Actions are same-origin POSTs with framework protections;
  document/verify configuration before launch.
- Consider email-confirmation and password-reset flows before production.
