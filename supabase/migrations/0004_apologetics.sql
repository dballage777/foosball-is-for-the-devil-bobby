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
