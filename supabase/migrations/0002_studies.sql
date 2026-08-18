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
