-- =============================================================
-- Berean — full database setup (run once in the Supabase SQL Editor).
-- Concatenates supabase/migrations/0001..0007 in order.
-- Safe to re-run: all statements are idempotent.
-- =============================================================


-- >>> migrations/0001_core.sql
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


-- >>> migrations/0002_studies.sql
-- =====================================================================
-- 0002_studies.sql — Collaborative virtual Bible studies
-- Private/invite-only studies are not discoverable; membership drives access.
-- =====================================================================

do $$ begin
  create type study_role as enum ('owner', 'admin', 'member', 'moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discussion_category as enum ('stood_out', 'discussion');
exception when duplicate_object then null; end $$;

-- ---- bible_studies ------------------------------------------------------
create table if not exists bible_studies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  description text,
  book_slug text,
  chapter int check (chapter >= 1),
  passage_ref text,
  study_date date,
  recurring_schedule text,       -- freeform, e.g. "Weekly on Wednesday"
  privacy visibility not null default 'private', -- 'private' | 'public'
  -- Opaque, unguessable invite token (not the DB id) for share links.
  invite_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists studies_updated_at on bible_studies;
create trigger studies_updated_at before update on bible_studies
  for each row execute function set_updated_at();

-- ---- bible_study_members ------------------------------------------------
create table if not exists bible_study_members (
  study_id uuid not null references bible_studies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role study_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (study_id, user_id)
);
create index if not exists idx_members_user on bible_study_members (user_id);

-- ---- bible_study_invitations -------------------------------------------
-- Optional revocable invite links beyond the study's default invite_token.
create table if not exists bible_study_invitations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references bible_studies(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  max_uses int,
  uses int not null default 0,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- shared_annotations -------------------------------------------------
-- A personal highlight/note the user explicitly chose to SHARE WITH STUDY.
create table if not exists shared_annotations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references bible_studies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_highlight_id uuid references bible_highlights(id) on delete set null,
  book_slug text not null,
  chapter int not null check (chapter >= 1),
  verse_start int not null check (verse_start >= 1),
  verse_end int not null check (verse_end >= verse_start),
  color highlight_color not null default 'yellow',
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_shared_study on shared_annotations (study_id);

-- ---- study_discussion_posts --------------------------------------------
create table if not exists study_discussion_posts (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references bible_studies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category discussion_category not null default 'discussion',
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_posts_study on study_discussion_posts (study_id, created_at);

drop trigger if exists posts_updated_at on study_discussion_posts;
create trigger posts_updated_at before update on study_discussion_posts
  for each row execute function set_updated_at();

-- ---- study_discussion_replies ------------------------------------------
create table if not exists study_discussion_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references study_discussion_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_replies_post on study_discussion_replies (post_id, created_at);

drop trigger if exists replies_updated_at on study_discussion_replies;
create trigger replies_updated_at before update on study_discussion_replies
  for each row execute function set_updated_at();

-- ---- study_applications ("What will you obey / apply?") -----------------
create table if not exists study_applications (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references bible_studies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_apps_study on study_applications (study_id, created_at);

drop trigger if exists apps_updated_at on study_applications;
create trigger apps_updated_at before update on study_applications
  for each row execute function set_updated_at();

-- =====================================================================
-- Membership helpers (SECURITY DEFINER) — evaluated with owner rights so
-- they can read membership without triggering the RLS policies that call
-- them (prevents infinite recursion).
-- =====================================================================
create or replace function is_study_member(p_study uuid, p_user uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from bible_study_members m
    where m.study_id = p_study and m.user_id = p_user
  );
$$;

create or replace function study_role_of(p_study uuid, p_user uuid)
returns study_role language sql security definer stable set search_path = public as $$
  select role from bible_study_members
  where study_id = p_study and user_id = p_user;
$$;

create or replace function can_manage_study(p_study uuid, p_user uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from bible_study_members m
    where m.study_id = p_study and m.user_id = p_user
      and m.role in ('owner', 'admin')
  );
$$;

-- Automatically enroll the creator as OWNER when a study is created.
create or replace function handle_new_study()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into bible_study_members (study_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_study_created on bible_studies;
create trigger on_study_created after insert on bible_studies
  for each row execute function handle_new_study();

-- =====================================================================
-- RLS
-- =====================================================================
alter table bible_studies enable row level security;
alter table bible_study_members enable row level security;
alter table bible_study_invitations enable row level security;
alter table shared_annotations enable row level security;
alter table study_discussion_posts enable row level security;
alter table study_discussion_replies enable row level security;
alter table study_applications enable row level security;

-- bible_studies: members can read; public studies are readable by anyone
-- authenticated; only owner/admins can update; owner can delete.
drop policy if exists studies_select on bible_studies;
create policy studies_select on bible_studies
  for select to authenticated
  using (
    owner_id = auth.uid()
    or privacy = 'public'
    or is_study_member(id, auth.uid())
  );
drop policy if exists studies_insert on bible_studies;
create policy studies_insert on bible_studies
  for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists studies_update on bible_studies;
create policy studies_update on bible_studies
  for update to authenticated
  using (can_manage_study(id, auth.uid())) with check (can_manage_study(id, auth.uid()));
drop policy if exists studies_delete on bible_studies;
create policy studies_delete on bible_studies
  for delete to authenticated using (owner_id = auth.uid());

-- members: a member can see co-members; managers can add/remove; a user can
-- remove themselves (leave). Insert of self as 'member' is done via a joining
-- RPC (see 0003) so invite tokens are validated server-side.
drop policy if exists members_select on bible_study_members;
create policy members_select on bible_study_members
  for select to authenticated
  using (is_study_member(study_id, auth.uid()));
drop policy if exists members_manage on bible_study_members;
create policy members_manage on bible_study_members
  for all to authenticated
  using (can_manage_study(study_id, auth.uid()))
  with check (can_manage_study(study_id, auth.uid()));
drop policy if exists members_leave on bible_study_members;
create policy members_leave on bible_study_members
  for delete to authenticated using (user_id = auth.uid());

-- invitations: only managers can see/create/revoke.
drop policy if exists invites_manage on bible_study_invitations;
create policy invites_manage on bible_study_invitations
  for all to authenticated
  using (can_manage_study(study_id, auth.uid()))
  with check (can_manage_study(study_id, auth.uid()));

-- shared_annotations: any member can read; a member writes only their own.
drop policy if exists shared_select on shared_annotations;
create policy shared_select on shared_annotations
  for select to authenticated using (is_study_member(study_id, auth.uid()));
drop policy if exists shared_insert on shared_annotations;
create policy shared_insert on shared_annotations
  for insert to authenticated
  with check (user_id = auth.uid() and is_study_member(study_id, auth.uid()));
drop policy if exists shared_delete on shared_annotations;
create policy shared_delete on shared_annotations
  for delete to authenticated
  using (user_id = auth.uid() or can_manage_study(study_id, auth.uid()));

-- discussion posts: members read; author writes own; managers moderate.
drop policy if exists posts_select on study_discussion_posts;
create policy posts_select on study_discussion_posts
  for select to authenticated using (is_study_member(study_id, auth.uid()));
drop policy if exists posts_insert on study_discussion_posts;
create policy posts_insert on study_discussion_posts
  for insert to authenticated
  with check (user_id = auth.uid() and is_study_member(study_id, auth.uid()));
drop policy if exists posts_update on study_discussion_posts;
create policy posts_update on study_discussion_posts
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists posts_delete on study_discussion_posts;
create policy posts_delete on study_discussion_posts
  for delete to authenticated
  using (user_id = auth.uid() or can_manage_study(study_id, auth.uid()));

-- replies: members read; author writes own; managers moderate.
drop policy if exists replies_select on study_discussion_replies;
create policy replies_select on study_discussion_replies
  for select to authenticated using (
    exists (
      select 1 from study_discussion_posts p
      where p.id = post_id and is_study_member(p.study_id, auth.uid())
    )
  );
drop policy if exists replies_insert on study_discussion_replies;
create policy replies_insert on study_discussion_replies
  for insert to authenticated with check (
    user_id = auth.uid() and exists (
      select 1 from study_discussion_posts p
      where p.id = post_id and is_study_member(p.study_id, auth.uid())
    )
  );
drop policy if exists replies_update on study_discussion_replies;
create policy replies_update on study_discussion_replies
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists replies_delete on study_discussion_replies;
create policy replies_delete on study_discussion_replies
  for delete to authenticated using (
    user_id = auth.uid() or exists (
      select 1 from study_discussion_posts p
      where p.id = post_id and can_manage_study(p.study_id, auth.uid())
    )
  );

-- applications: members read; author writes own.
drop policy if exists apps_select on study_applications;
create policy apps_select on study_applications
  for select to authenticated using (is_study_member(study_id, auth.uid()));
drop policy if exists apps_insert on study_applications;
create policy apps_insert on study_applications
  for insert to authenticated
  with check (user_id = auth.uid() and is_study_member(study_id, auth.uid()));
drop policy if exists apps_update on study_applications;
create policy apps_update on study_applications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists apps_delete on study_applications;
create policy apps_delete on study_applications
  for delete to authenticated
  using (user_id = auth.uid() or can_manage_study(study_id, auth.uid()));


-- >>> migrations/0003_join_and_audio.sql
-- =====================================================================
-- 0003_join_and_audio.sql — Secure study joining + chapter audio mapping
-- =====================================================================

-- ---- Join a study via an opaque invite token --------------------------
-- SECURITY DEFINER so it can validate the token and enroll the caller as a
-- 'member' without granting a blanket self-insert policy on the members table
-- (which would let anyone add themselves to any study). Accepts either a
-- study's default invite_token or a per-link invitations.token.
create or replace function join_study_with_token(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_study uuid;
  v_invite bible_study_invitations%rowtype;
begin
  if v_uid is null then
    raise exception 'Must be signed in to join a study.'
      using errcode = '28000';
  end if;

  -- Try the study's built-in token first.
  select id into v_study from bible_studies where invite_token = p_token;

  -- Otherwise try a revocable invitation link.
  if v_study is null then
    select * into v_invite from bible_study_invitations where token = p_token;
    if v_invite.id is null then
      raise exception 'Invalid invitation link.' using errcode = 'P0002';
    end if;
    if v_invite.revoked
       or (v_invite.expires_at is not null and v_invite.expires_at < now())
       or (v_invite.max_uses is not null and v_invite.uses >= v_invite.max_uses) then
      raise exception 'This invitation link has expired.' using errcode = 'P0003';
    end if;
    v_study := v_invite.study_id;
    update bible_study_invitations set uses = uses + 1 where id = v_invite.id;
  end if;

  insert into bible_study_members (study_id, user_id, role)
  values (v_study, v_uid, 'member')
  on conflict (study_id, user_id) do nothing;

  return v_study;
end $$;

revoke all on function join_study_with_token(text) from public;
grant execute on function join_study_with_token(text) to authenticated;

-- ---- audio_resources ----------------------------------------------------
-- Chapter-specific background/audio mappings (e.g. Listener's Commentary).
-- We store official links/embeds and NEVER re-host copyrighted audio unless
-- explicitly authorized (audio_url stays null otherwise). See
-- docs/audio-licensing.md.
create table if not exists audio_resources (
  id uuid primary key default gen_random_uuid(),
  book_slug text not null,
  chapter int not null check (chapter >= 1),
  title text not null,
  provider text not null default 'Listener''s Commentary',
  page_url text not null,          -- official page (always safe to link)
  embed_url text,                  -- official embed, only if terms allow
  audio_url text,                  -- direct audio, ONLY if authorized to host
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_audio_ref on audio_resources (book_slug, chapter);

drop trigger if exists audio_updated_at on audio_resources;
create trigger audio_updated_at before update on audio_resources
  for each row execute function set_updated_at();

-- Audio mappings are public reference content: readable by all, writable only
-- by service-role/admin tooling (no policy grants writes to app users).
alter table audio_resources enable row level security;
drop policy if exists audio_select on audio_resources;
create policy audio_select on audio_resources for select using (true);


-- >>> migrations/0004_apologetics.sql
-- =====================================================================
-- 0004_apologetics.sql — Apologetics knowledge base + resource library
-- All content here is public reference material: world-readable, writable
-- only by trusted server tooling (no write policies for app users).
-- =====================================================================

do $$ begin
  create type resource_type as enum (
    'article', 'podcast', 'podcast_episode', 'spotify_show', 'spotify_episode',
    'youtube_channel', 'youtube_video', 'book', 'debate', 'course',
    'video', 'external_resource'
  );
exception when duplicate_object then null; end $$;

-- ---- apologetics_sources (organizations / ministries / authors) ---------
create table if not exists apologetics_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website_url text,
  description text,
  official boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---- apologetics_categories (top-level evidence areas) ------------------
create table if not exists apologetics_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  sort_order int not null default 0
);

-- ---- apologetics_topics (subtopics within a category) -------------------
create table if not exists apologetics_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references apologetics_categories(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  -- Longer explanatory body (original educational prose, not copyrighted text).
  body text,
  sort_order int not null default 0,
  unique (category_id, slug)
);

-- ---- apologetics_resources (the searchable library) ---------------------
create table if not exists apologetics_resources (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references apologetics_sources(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  author text,
  speaker text,
  resource_type resource_type not null,
  url text not null,
  publication_date date,
  verified boolean not null default false,   -- URL confirmed to resolve
  official boolean not null default false,   -- from an official source
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_resources_type on apologetics_resources (resource_type);
create index if not exists idx_resources_source on apologetics_resources (source_id);

drop trigger if exists resources_updated_at on apologetics_resources;
create trigger resources_updated_at before update on apologetics_resources
  for each row execute function set_updated_at();

-- ---- resource_topics (many-to-many: resources <-> topics) ---------------
create table if not exists resource_topics (
  resource_id uuid not null references apologetics_resources(id) on delete cascade,
  topic_id uuid not null references apologetics_topics(id) on delete cascade,
  primary key (resource_id, topic_id)
);

-- ---- bible_apologetics_links (scripture <-> topic) ----------------------
-- Curated, non-arbitrary associations, e.g. 1 Peter 3:15 -> apologetics.
create table if not exists bible_apologetics_links (
  id uuid primary key default gen_random_uuid(),
  book_slug text not null,
  chapter int not null check (chapter >= 1),
  verse_start int,
  verse_end int,
  topic_id uuid not null references apologetics_topics(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (book_slug, chapter, topic_id)
);
create index if not exists idx_bal_ref on bible_apologetics_links (book_slug, chapter);

-- ---- RLS: read-only for everyone --------------------------------------
alter table apologetics_sources enable row level security;
alter table apologetics_categories enable row level security;
alter table apologetics_topics enable row level security;
alter table apologetics_resources enable row level security;
alter table resource_topics enable row level security;
alter table bible_apologetics_links enable row level security;

drop policy if exists src_read on apologetics_sources;
create policy src_read on apologetics_sources for select using (true);
drop policy if exists cat_read on apologetics_categories;
create policy cat_read on apologetics_categories for select using (true);
drop policy if exists topic_read on apologetics_topics;
create policy topic_read on apologetics_topics for select using (true);
drop policy if exists res_read on apologetics_resources;
create policy res_read on apologetics_resources for select using (true);
drop policy if exists rt_read on resource_topics;
create policy rt_read on resource_topics for select using (true);
drop policy if exists bal_read on bible_apologetics_links;
create policy bal_read on bible_apologetics_links for select using (true);


-- >>> migrations/0005_seed_apologetics.sql
-- =====================================================================
-- 0005_seed_apologetics.sql — Seed content for the apologetics library.
--
-- SOURCING RULE: only URLs that have been explicitly provided/verified are
-- inserted with verified = true. No resource URL is invented here. Deeper
-- per-topic resource research is tracked in docs/apologetics-research.md and
-- must be added only after each URL is confirmed to resolve.
-- =====================================================================

-- ---- Sources (official ministries; URLs provided/verified) --------------
insert into apologetics_sources (name, slug, website_url, description, official) values
  ('Cold-Case Christianity', 'cold-case-christianity', 'https://coldcasechristianity.com/',
   'J. Warner Wallace — cold-case detective examining the claims of Christianity using investigative methodology.', true),
  ('Cross Examined', 'cross-examined', 'https://crossexamined.org/',
   'Frank Turek''s ministry equipping Christians to give reasons for their faith.', true),
  ('John Lennox', 'john-lennox', 'https://johnlennox.org/',
   'Oxford mathematician and philosopher of science engaging questions of God, science, and faith.', true)
on conflict (slug) do nothing;

-- ---- Verified official channel/show resources (explicitly provided) -----
insert into apologetics_resources
  (source_id, title, slug, description, resource_type, url, verified, official, featured)
select s.id, v.title, v.slug, v.description, v.rtype::resource_type, v.url, true, true, v.featured
from (values
  ('cold-case-christianity', 'Cold-Case Christianity — Website',
    'ccc-website', 'Articles and case-making resources from J. Warner Wallace.',
    'external_resource', 'https://coldcasechristianity.com/', true),
  ('cold-case-christianity', 'Cold-Case Christianity — Podcast (Spotify)',
    'ccc-spotify', 'The Cold-Case Christianity podcast on Spotify.',
    'spotify_show', 'https://open.spotify.com/show/7aSbO4B9TAnP4unGDhpKhL', false),
  ('cold-case-christianity', 'Cold-Case Christianity — YouTube',
    'ccc-youtube', 'Official Cold-Case Christianity YouTube channel.',
    'youtube_channel', 'https://m.youtube.com/@ColdCaseChristianity', false),
  ('cross-examined', 'Cross Examined — Website',
    'ce-website', 'Frank Turek''s apologetics ministry and articles.',
    'external_resource', 'https://crossexamined.org/', true),
  ('cross-examined', 'Cross Examined — Podcast (Spotify)',
    'ce-spotify', 'The Cross Examined podcast on Spotify.',
    'spotify_show', 'https://open.spotify.com/show/33MgzSFOheNQ8BnxMGbDOv', false),
  ('cross-examined', 'Cross Examined — YouTube',
    'ce-youtube', 'Official Cross Examined YouTube channel.',
    'youtube_channel', 'https://m.youtube.com/@CrossExamined', false),
  ('john-lennox', 'John Lennox — Official Website',
    'lennox-website', 'Books, articles, talks, and resources from John Lennox.',
    'external_resource', 'https://johnlennox.org/', true)
) as v(source_slug, title, slug, description, rtype, url, featured)
join apologetics_sources s on s.slug = v.source_slug
on conflict (slug) do nothing;

-- ---- Categories (16 evidence areas) -------------------------------------
insert into apologetics_categories (slug, title, summary, sort_order) values
  ('does-god-exist', 'Does God Exist?', 'Cosmological, contingency, design, moral, and consciousness arguments for God.', 1),
  ('origin-of-the-universe', 'Origin of the Universe', 'Why the universe began and why anything exists at all.', 2),
  ('fine-tuning', 'Fine-Tuning', 'The life-permitting balance of physical constants and initial conditions.', 3),
  ('origin-of-life', 'Origin of Life & Biological Information', 'The origin of life, DNA, and biological information.', 4),
  ('objective-morality', 'Objective Morality', 'Whether moral facts and duties are real and how worldviews explain them.', 5),
  ('consciousness-reason-free-will', 'Consciousness, Reason & Free Will', 'Mind, rationality, and freedom under competing worldviews.', 6),
  ('biblical-reliability', 'Biblical Reliability', 'Transmission, manuscripts, and textual criticism of the Bible.', 7),
  ('new-testament-reliability', 'New Testament Reliability', 'Dating, authorship, and eyewitness testimony of the Gospels.', 8),
  ('archaeology', 'Archaeology & Historical Corroboration', 'People, places, and artifacts corroborating the biblical record.', 9),
  ('historical-jesus', 'Historical Jesus', 'What history can establish about Jesus of Nazareth.', 10),
  ('resurrection', 'Resurrection of Jesus', 'The historical case for the resurrection and its alternative explanations.', 11),
  ('christianity-and-science', 'Christianity & Science', 'The relationship between scientific inquiry and Christian faith.', 12),
  ('miracles', 'Miracles', 'Whether miracles are possible and how they are evaluated.', 13),
  ('evil-and-suffering', 'Evil & Suffering', 'The logical and evidential problems of evil and Christian responses.', 14),
  ('worldviews', 'Worldviews', 'How major worldviews compare in explaining reality.', 15),
  ('common-objections', 'Common Objections', 'Fair treatments of frequently raised objections to Christianity.', 16)
on conflict (slug) do nothing;

-- ---- Topics (representative; expand via research doc) -------------------
insert into apologetics_topics (category_id, slug, title, summary, sort_order)
select c.id, t.slug, t.title, t.summary, t.sort_order
from (values
  ('does-god-exist', 'cosmological-argument', 'The Cosmological Argument', 'From the beginning of the universe to a first cause.', 1),
  ('does-god-exist', 'contingency-argument', 'The Argument from Contingency', 'Why there is something rather than nothing.', 2),
  ('does-god-exist', 'design-argument', 'The Design Argument', 'Apparent design in nature and its best explanation.', 3),
  ('does-god-exist', 'moral-argument', 'The Moral Argument', 'From objective moral values and duties to God.', 4),
  ('origin-of-the-universe', 'universe-had-a-beginning', 'Did the Universe Begin?', 'Cosmological and philosophical reasons for a beginning.', 1),
  ('origin-of-the-universe', 'cause-of-the-universe', 'What Caused the Universe?', 'Candidate explanations and their adequacy.', 2),
  ('fine-tuning', 'physical-constants', 'Fine-Tuning of Constants', 'Life-permitting values of the fundamental constants.', 1),
  ('fine-tuning', 'multiverse-objection', 'The Multiverse Objection', 'Does a multiverse explain away fine-tuning?', 2),
  ('origin-of-life', 'biological-information', 'The Origin of Biological Information', 'Where the information in DNA came from.', 1),
  ('origin-of-life', 'interpretation-layers', 'Observation vs. Interpretation', 'Distinguishing data, scientific interpretation, and philosophy.', 2),
  ('objective-morality', 'moral-facts', 'Are There Moral Facts?', 'Objective vs. subjective accounts of morality.', 1),
  ('objective-morality', 'grounding-morality', 'Grounding Moral Duties', 'How different worldviews ground obligation and dignity.', 2),
  ('consciousness-reason-free-will', 'argument-from-reason', 'The Argument from Reason', 'Can naturalism account for rational thought?', 1),
  ('consciousness-reason-free-will', 'hard-problem', 'The Hard Problem of Consciousness', 'Why subjective experience resists physical reduction.', 2),
  ('biblical-reliability', 'textual-transmission', 'Textual Transmission', 'How the text was copied and what we can reconstruct.', 1),
  ('new-testament-reliability', 'gospel-dating', 'Dating the Gospels', 'When the Gospels were written and why it matters.', 1),
  ('new-testament-reliability', 'eyewitness-testimony', 'Eyewitness Testimony', 'The case that the Gospels rest on eyewitness sources.', 2),
  ('archaeology', 'people-and-places', 'People, Places & Inscriptions', 'Archaeological corroboration of the biblical record.', 1),
  ('historical-jesus', 'existence-of-jesus', 'Did Jesus Exist?', 'The historical evidence for Jesus of Nazareth.', 1),
  ('historical-jesus', 'crucifixion', 'The Crucifixion', 'Why Jesus'' death by crucifixion is widely accepted history.', 2),
  ('resurrection', 'minimal-facts', 'The Minimal-Facts Approach', 'Building a case from data broadly granted by scholars.', 1),
  ('resurrection', 'empty-tomb', 'The Empty Tomb', 'Historical arguments for the empty tomb.', 2),
  ('resurrection', 'appearances', 'Post-Mortem Appearances', 'The reported appearances to disciples, Paul, and James.', 3),
  ('resurrection', 'alt-hallucination', 'Objection: Hallucination', 'Fair statement and response to the hallucination hypothesis.', 4),
  ('resurrection', 'alt-stolen-body', 'Objection: Stolen Body', 'Fair statement and response to the stolen-body hypothesis.', 5),
  ('resurrection', 'alt-swoon', 'Objection: Swoon Theory', 'Fair statement and response to the swoon hypothesis.', 6),
  ('resurrection', 'alt-legend', 'Objection: Legend', 'Fair statement and response to the legend hypothesis.', 7),
  ('christianity-and-science', 'methodological-naturalism', 'Kinds of Naturalism', 'Methodological vs. philosophical naturalism.', 1),
  ('miracles', 'hume-on-miracles', 'Hume on Miracles', 'Assessing the classic argument against miracles.', 1),
  ('evil-and-suffering', 'logical-problem', 'The Logical Problem of Evil', 'The free-will defense and logical consistency.', 1),
  ('evil-and-suffering', 'evidential-problem', 'The Evidential Problem of Evil', 'Probabilistic arguments from suffering and responses.', 2),
  ('worldviews', 'worldview-comparison', 'Comparing Worldviews', 'How worldviews answer origin, meaning, morality, and destiny.', 1),
  ('common-objections', 'who-created-god', 'Who Created God?', 'Why the question assumes God is a contingent being.', 1),
  ('common-objections', 'bible-changed', 'Has the Bible Been Changed?', 'Transmission and the reliability of the text.', 2),
  ('common-objections', 'copied-from-pagan', 'Was Christianity Copied from Pagan Myths?', 'Assessing the copycat thesis.', 3)
) as t(cat_slug, slug, title, summary, sort_order)
join apologetics_categories c on c.slug = t.cat_slug
on conflict (category_id, slug) do nothing;

-- ---- Curated, non-arbitrary Scripture <-> apologetics links -------------
insert into bible_apologetics_links (book_slug, chapter, verse_start, verse_end, topic_id, note)
select l.book_slug, l.chapter, l.vs, l.ve, tp.id, l.note
from (values
  ('1-peter', 3, 15, 16, 'does-god-exist', 'cosmological-argument',
    'The biblical mandate to give a reasoned defense ("give an answer") for hope in Christ.'),
  ('john', 20, null, null, 'resurrection', 'appearances',
    'Resurrection appearances, including to Thomas.'),
  ('1-corinthians', 15, 3, 8, 'resurrection', 'minimal-facts',
    'Early creed listing death, burial, resurrection, and appearances.'),
  ('romans', 1, 19, 20, 'does-god-exist', 'design-argument',
    'General revelation: God''s attributes perceived through creation.'),
  ('genesis', 1, 1, 1, 'origin-of-the-universe', 'universe-had-a-beginning',
    'The universe has a beginning: "In the beginning God created..."'),
  ('psalms', 19, 1, 4, 'does-god-exist', 'design-argument',
    'Natural revelation: the heavens declare the glory of God.')
) as l(book_slug, chapter, vs, ve, cat_slug, topic_slug, note)
join apologetics_categories c on c.slug = l.cat_slug
join apologetics_topics tp on tp.category_id = c.id and tp.slug = l.topic_slug
on conflict (book_slug, chapter, topic_id) do nothing;


-- >>> migrations/0006_seed_resources.sql
-- =====================================================================
-- 0006_seed_resources.sql — Additional verified apologetics resources.
--
-- SOURCING RULE (see docs/apologetics-research.md): every URL below was
-- verified to resolve to the official owner before being added. No URL is
-- invented. Resources are mapped only to topics they genuinely fit.
-- Idempotent: safe to re-run.
-- =====================================================================

-- ---- New official sources ----------------------------------------------
insert into apologetics_sources (name, slug, website_url, description, official) values
  ('Reasonable Faith', 'reasonable-faith', 'https://www.reasonablefaith.org/',
   'The work of philosopher and theologian Dr. William Lane Craig — arguments for God, the resurrection, and free apologetics training.', true),
  ('Stand to Reason', 'stand-to-reason', 'https://www.str.org/',
   'Greg Koukl''s ministry training Christians to think clearly and engage graciously (Tactics, #STRask).', true),
  ('GotQuestions.org', 'got-questions', 'https://www.gotquestions.org/',
   'Biblically based answers to a very wide range of questions, including an extensive apologetics section.', true),
  ('Reasons to Believe', 'reasons-to-believe', 'https://reasons.org/',
   'Hugh Ross''s ministry exploring the compatibility of science and Christian faith (cosmology, fine-tuning).', true)
on conflict (slug) do nothing;

-- ---- Verified resources -------------------------------------------------
insert into apologetics_resources
  (source_id, title, slug, description, resource_type, url, verified, official, featured)
select s.id, v.title, v.slug, v.description, v.rtype::resource_type, v.url, true, true, v.featured
from (values
  ('reasonable-faith', 'Reasonable Faith — Website',
    'rf-website', 'Articles, Q&A, and free guided apologetics courses from William Lane Craig.',
    'external_resource', 'https://www.reasonablefaith.org/', true),
  ('reasonable-faith', 'Reasonable Faith — YouTube',
    'rf-youtube', 'Lectures, debates, and podcasts from Reasonable Faith.',
    'youtube_channel', 'https://www.youtube.com/user/ReasonableFaithOrg', false),
  ('stand-to-reason', 'Stand to Reason — Website',
    'str-website', 'Greg Koukl''s articles and training on thinking and engaging well.',
    'external_resource', 'https://www.str.org/', false),
  ('stand-to-reason', 'Stand to Reason — Podcasts',
    'str-podcasts', 'The Stand to Reason and #STRask podcasts.',
    'podcast', 'https://www.str.org/podcasts', false),
  ('got-questions', 'GotQuestions.org — Website',
    'gq-website', 'Biblical answers across a huge range of questions and objections.',
    'external_resource', 'https://www.gotquestions.org/', false),
  ('got-questions', 'What Is Christian Apologetics? (GotQuestions)',
    'gq-apologetics', 'A concise introduction to what apologetics is and why it matters.',
    'article', 'https://www.gotquestions.org/Christian-apologetics.html', false),
  ('reasons-to-believe', 'Reasons to Believe — Website',
    'rtb-website', 'Science-and-faith resources on cosmology, fine-tuning, and origins.',
    'external_resource', 'https://reasons.org/', false)
) as v(source_slug, title, slug, description, rtype, url, featured)
join apologetics_sources s on s.slug = v.source_slug
on conflict (slug) do nothing;

-- ---- Map resources to the topics they genuinely address -----------------
insert into resource_topics (resource_id, topic_id)
select r.id, tp.id
from (values
  ('rf-website', 'cosmological-argument'),
  ('rf-website', 'contingency-argument'),
  ('rf-website', 'moral-argument'),
  ('rf-website', 'minimal-facts'),
  ('rf-youtube', 'cosmological-argument'),
  ('rf-youtube', 'minimal-facts'),
  ('str-website', 'who-created-god'),
  ('str-website', 'moral-facts'),
  ('str-podcasts', 'bible-changed'),
  ('str-podcasts', 'who-created-god'),
  ('gq-website', 'who-created-god'),
  ('gq-website', 'bible-changed'),
  ('gq-website', 'copied-from-pagan'),
  ('gq-apologetics', 'argument-from-reason'),
  ('gq-apologetics', 'cosmological-argument'),
  ('rtb-website', 'methodological-naturalism'),
  ('rtb-website', 'physical-constants'),
  ('rtb-website', 'universe-had-a-beginning')
) as m(resource_slug, topic_slug)
join apologetics_resources r on r.slug = m.resource_slug
join apologetics_topics tp on tp.slug = m.topic_slug
on conflict (resource_id, topic_id) do nothing;


-- >>> migrations/0007_fix_studies_select.sql
-- =====================================================================
-- 0007_fix_studies_select.sql — Let a study's owner always read it.
--
-- The original studies_select policy relied on membership (added by an
-- AFTER-INSERT trigger). Immediately after creating a study, reading the row
-- back through RLS could fail due to trigger/visibility timing. Adding
-- `owner_id = auth.uid()` makes the owner's own study always readable.
-- Idempotent: safe to re-run.
-- =====================================================================

drop policy if exists studies_select on bible_studies;
create policy studies_select on bible_studies
  for select to authenticated
  using (
    owner_id = auth.uid()
    or privacy = 'public'
    or is_study_member(id, auth.uid())
  );

