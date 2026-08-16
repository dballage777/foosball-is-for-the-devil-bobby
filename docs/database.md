# Database

Postgres via Supabase. Migrations are in `supabase/migrations/`, applied in
filename order. All app-facing tables have **Row Level Security** enabled.

## Migrations

| File | Contents |
|---|---|
| `0001_core.sql` | `profiles`, `bible_highlights`, `bible_notes`, `bookmarks`, `reading_history`; enums; `updated_at` + new-user triggers; RLS. |
| `0002_studies.sql` | `bible_studies`, `bible_study_members`, `bible_study_invitations`, `shared_annotations`, `study_discussion_posts`, `study_discussion_replies`, `study_applications`; membership helper functions; RLS. |
| `0003_join_and_audio.sql` | `join_study_with_token()` RPC; `audio_resources`; RLS. |
| `0004_apologetics.sql` | `apologetics_sources`, `apologetics_categories`, `apologetics_topics`, `apologetics_resources`, `resource_topics`, `bible_apologetics_links`; RLS (read-only). |
| `0005_seed_apologetics.sql` | Seed sources, categories, topics, verified resources, scripture links. |

## Enums
`visibility` (private/study/public), `highlight_color` (yellow/green/blue/red/
purple/orange), `study_role` (owner/admin/member/moderator), `discussion_category`
(stood_out/discussion), `resource_type` (article … external_resource).

## Authorization model (RLS)

- **Personal data** (`bible_highlights`, `bookmarks`, `reading_history`,
  private `bible_notes`): owner-only for all operations (`user_id = auth.uid()`).
- **Public notes**: `bible_notes` with `visibility = 'public'` are world-readable;
  writes remain owner-only.
- **Studies**: readable to members (or anyone if `privacy = 'public'`);
  managed by owner/admins. Membership is checked via `SECURITY DEFINER`
  helpers `is_study_member`, `can_manage_study`, `study_role_of` to prevent
  policy recursion.
- **Study content** (`shared_annotations`, posts, replies, applications):
  readable by members; each row writable by its author; owner/admins moderate.
- **Joining**: users cannot self-insert into `bible_study_members` directly.
  They call the `join_study_with_token()` RPC, which validates an opaque token
  (study `invite_token` or a revocable `bible_study_invitations.token`) before
  enrolling them as `member`.
- **Reference content** (`audio_resources`, all apologetics tables):
  world-readable; no write policy for app users (populated by trusted tooling).

## Triggers
- `on_auth_user_created` → auto-creates a `profiles` row.
- `on_study_created` → enrolls the creator as `owner`.
- `set_updated_at` on all mutable tables.

## Notes on IDs
Internal UUIDs are never used as capabilities. Invite links use separate opaque
random tokens (`encode(gen_random_bytes(16), 'hex')`).
