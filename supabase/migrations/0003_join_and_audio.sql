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
