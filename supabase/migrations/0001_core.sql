-- =====================================================================
-- 0001_core.sql — Profiles + personal Bible study data
-- Enforces per-user privacy via Row Level Security (RLS).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---- Enums --------------------------------------------------------------
do $$ begin
  create type visibility as enum ('private', 'study', 'public');
exception when duplicate_object then null; end $$;

do $$ begin
  create type highlight_color as enum
    ('yellow', 'green', 'blue', 'red', 'purple', 'orange');
exception when duplicate_object then null; end $$;

-- ---- updated_at helper --------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---- profiles -----------------------------------------------------------
-- One row per auth user. Public-safe display fields only.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Friend',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile whenever an auth user is created.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---- bible_highlights ---------------------------------------------------
create table if not exists bible_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_slug text not null,
  chapter int not null check (chapter >= 1),
  verse_start int not null check (verse_start >= 1),
  verse_end int not null check (verse_end >= verse_start),
  color highlight_color not null default 'yellow',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_highlights_user_ref
  on bible_highlights (user_id, book_slug, chapter);

drop trigger if exists highlights_updated_at on bible_highlights;
create trigger highlights_updated_at before update on bible_highlights
  for each row execute function set_updated_at();

-- ---- bible_notes --------------------------------------------------------
-- Notes attach to a verse, verse range, or whole chapter (verse_start null).
create table if not exists bible_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_slug text not null,
  chapter int not null check (chapter >= 1),
  verse_start int check (verse_start >= 1),
  verse_end int,
  body text not null,
  visibility visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (verse_end is null or (verse_start is not null and verse_end >= verse_start))
);
create index if not exists idx_notes_user_ref
  on bible_notes (user_id, book_slug, chapter);

drop trigger if exists notes_updated_at on bible_notes;
create trigger notes_updated_at before update on bible_notes
  for each row execute function set_updated_at();

-- ---- bookmarks ----------------------------------------------------------
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_slug text not null,
  chapter int not null check (chapter >= 1),
  verse int check (verse >= 1),
  label text,
  created_at timestamptz not null default now(),
  unique (user_id, book_slug, chapter, verse)
);

-- ---- reading_history ----------------------------------------------------
create table if not exists reading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_slug text not null,
  chapter int not null check (chapter >= 1),
  last_read_at timestamptz not null default now(),
  unique (user_id, book_slug, chapter)
);
create index if not exists idx_history_recent
  on reading_history (user_id, last_read_at desc);

-- =====================================================================
-- Row Level Security — personal data is owner-only, except notes marked
-- 'public' which anyone may read (still owner-only for writes).
-- =====================================================================
alter table profiles enable row level security;
alter table bible_highlights enable row level security;
alter table bible_notes enable row level security;
alter table bookmarks enable row level security;
alter table reading_history enable row level security;

-- profiles: readable by any authenticated user (display names in studies);
-- writable only by the owner.
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles
  for select to authenticated using (true);
drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles
  for insert to authenticated with check (id = auth.uid());

-- highlights: strictly owner-only for all operations.
drop policy if exists highlights_all on bible_highlights;
create policy highlights_all on bible_highlights
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- notes: owner has full access; 'public' notes are world-readable.
drop policy if exists notes_select_own on bible_notes;
create policy notes_select_own on bible_notes
  for select to authenticated using (user_id = auth.uid());
drop policy if exists notes_select_public on bible_notes;
create policy notes_select_public on bible_notes
  for select using (visibility = 'public');
drop policy if exists notes_modify_own on bible_notes;
create policy notes_modify_own on bible_notes
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists notes_update_own on bible_notes;
create policy notes_update_own on bible_notes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notes_delete_own on bible_notes;
create policy notes_delete_own on bible_notes
  for delete to authenticated using (user_id = auth.uid());

-- bookmarks + history: owner-only.
drop policy if exists bookmarks_all on bookmarks;
create policy bookmarks_all on bookmarks
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists history_all on reading_history;
create policy history_all on reading_history
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
